package Quran::Controller::Content;
use Moose;
use namespace::autoclean;
use HTML::Entities;

BEGIN { extends 'Catalyst::Controller' }

my ($c, $surah, $first, $last);

sub _ref {
	my $self = shift;
	$c = shift;
	if (scalar @_ == 3) {
		($surah, $first, $last) = @_;
	}
	elsif (scalar @_ == 1) {
		($surah, $first) = split /:/, $_[0];
		$last = $first;
	}
	else {
		die "Incorrect number of arguments passed to Quran::Controller::Content";
	}
	return $self;
}

sub quran {
	my ($self, $params) = (shift, shift);

	my $array;

	if ($params->{text}) {
		$array = $self->text($params->{text});
	}
	elsif ($params->{words}) {
		$array = $self->words;
	}
	elsif ($params->{images}) {
		$array = $self->images;
	}

	return $array;
}

sub words {
	my $self = shift;

	my $stash = $c->stash;
	my $array;

	unless ($array = $c->memcache("words:$surah:$stash->{language}->{language_code}")) {
		my @set = $c->model('DB::View::Word')->search(undef, {
			bind => [$stash->{language}->{language_code}, $surah]
		});
=cut
		my @set = $c->model('DB::Complex::Glyph')->search({
			'ayah.surah_id' => $surah,
			'translation.language_code' => [$language_code, undef], #[@{ $c->i18n->{language}->{installed}->{array} }, undef]
		}, {
					 join  => ['ayah', 'type', { word => [qw/root lemma arabic translation/]}],
				columns  => [
					{ i => 'ayah.ayah_num' },
					{ j => 'glyph_pos' },
					{ page => 'page_num' },
					{ code => 'code_hex' },
					{ type => 'type.name' },
					{ position => 'word.word_pos' },
					{ root => 'root.value' },
					{ lemma => 'lemma.value' },
					{ arabic => 'arabic.value' },
					{ id => 'word.word_id' },
					{ language_code => 'translation.language_code' },
					{ translation => 'translation.value' }
				],
			 order_by  => { -asc => ['ayah.ayah_num', 'me.glyph_pos', 'translation.language_code'] }
		});
=cut
		foreach my $result (@set) {
			my $i = $result->get_column('i') - 1;
			my $j = $result->get_column('j') - 1;
			$result = $result->{_column_data};
			if (not defined $array->[$i]->[$j]) {
				$result->{code} = '&#x'. $result->{code} .';';
				$array->[$i]->[$j] = $result;
				if ($result->{type} eq 'word') {
					$result->{corpus}->{$_} = $result->{$_} for qw/arabic root lemma position id/;
					if ($result->{translation}) {
						$result->{corpus}->{translation}->{ $result->{language_code} } = encode_entities decode_entities($result->{translation} or '');
					}
				}
				delete $result->{$_} for qw/i j arabic root lemma position id language_code translation/;
			}
			else {
				my $stored_result = $array->[$i]->[$j];
				if ($result->{type} eq 'word' and $result->{translation}) {
					$stored_result->{corpus}->{translation}->{ $result->{language_code} } = encode_entities decode_entities($result->{translation} or '');
				}
			}
		}
		$c->memcache("words:$surah:$stash->{language}->{language_code}", $array);
	}

	$array = [@{ $array }[$first - 1 .. $last - 1]];

	return [ map { { words => $_  } } @{ $array } ];
}

sub text {
	my $self = shift;
	my $resource_code = shift;
	return [ map { {
		text => $_->[0]
	} } @{ $self->resource('text', 'ar', $resource_code) } ];
}

sub images {
	my $self = shift;
	my $array;

	unless ($array = $c->memcache("images:$surah")) {
		my $alt = $self->resource('text', 'ar', 'simple_minimal', 1);
		   $alt = [ map { $_->[0] } @{ $alt } ];
		for (my $i = 0; $i < $c->stash->{surahs}->[$surah - 1]->{ayahs}; $i++) {
			my $ayah = $i + 1;
			$array->[$i] = {
#				  url => 'http://c22506.r6.cf1.rackcdn.com/'. $surah .'_'. $ayah .'.png',
				  url => 'http://quran.com/images/ayat/'. $surah .'_'. $ayah .'.png',
				width => 675,
				  alt => $alt->[$i]->{text}
			};
		}
		$c->memcache("images:$surah", $array);
	}

	$array = [@{ $array }[$first - 1 .. $last - 1]];

	return [ map { { images => $_  } } @{ $array } ];
}

sub corpus {
	my ($self, $array) = @_;
	my $hash;
	unless ($array) {
		for (@{ $self->words }) {
			for (@{ $_->{words} }) {
				$hash->{ $_->{corpus}->{id} } = $_->{corpus} if exists $_->{corpus};
			}
		}
	}
	else {
		for (@{ $array }) {
			for (@{ $_->{words} }) {
				$hash->{ $_->{corpus}->{id} } = $_->{corpus} if exists $_->{corpus};
			}
		}
	}
	return $hash;
}

sub translation {
	my ($self, $params) = @_;

	my $stash = $c->stash;
	my $array;

	my $build = sub {
		my $resource_code = shift;

		my $_array = $self->resource('translation', $stash->{language}->{language_code}, $resource_code);

		unless ($array and scalar @{ $array } > 0) {
			$array = $_array;
		}
		else {
			for (my $i = 0; $i < scalar @{ $array }; $i++) {
				push @{ $array->[$i] }, $_array->[$i]->[0];
			}
		}
	};

	for (keys %{ $params }) {
		$build->($_) if $params->{ $_ };
	}

	return $array;
}

sub transliteration {
	my ($self, $get) = @_;
	my $stash = $c->stash;
	return $get ? $self->resource('transliteration', $stash->{language}->{language_code}, 'transliteration') : [];
}

sub resource {
	my ($self, $type, $language_code, $resource_code, $all) = @_;

	my $array;

	unless ($array = $c->memcache("$type:$language_code:$resource_code:$surah")) {
		my @set = $c->model('DB::Content::Resource')->search({
			'me.type'          => $type,
			'me.language_code' => $language_code,
			'me.resource_code' => $resource_code,
			'ayah.surah_id'    => $surah,
		}, {
			join     => ['language', 'author', { $type => 'ayah' }],
			columns  => [
				{   direction => 'language.direction' },
				{        text => "$type.text"         },
				{        name => 'me.name'            },
				{ author_name => 'author.name'        },
				{ author_url  => 'author.url'         }
			],
			order_by => { -asc => ['ayah.ayah_num'] }
		});

		$array = [ map { [ {
			type          => $type,
			resource_code => $resource_code,
			name          => $_->{_column_data}->{name},
			text          => decode_entities($_->{_column_data}->{text} or ''),
			author => {
				name => $_->{_column_data}->{author_name},
				url  => $_->{_column_data}->{author_url},
			},
			language => {
				language_code => $language_code,
				direction     => $_->{_column_data}->{direction},
			},
		} ] } @set ];

		$c->memcache("$type:$language_code:$resource_code:$surah", $array);
	}

	return $array if $all;
	return [@{ $array }[$first - 1 .. $last - 1]];
}

__PACKAGE__->meta->make_immutable;

1;
