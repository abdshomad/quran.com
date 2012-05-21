package Quran::Model::Content;
use Moose;
use namespace::autoclean;
use HTML::Entities;

extends 'Catalyst::Model';

sub resources {
	my ($self, $c, $resources, $keys) = (shift, shift, shift, shift);
	my ($cache, $content) = ($c->cache('memcache'));

	for my $ayah_key (@{ $keys }) {
		for my $resource (@{ $resources }) {
			my ($cache_key, $result) = ("$resource->{language_code}:$resource->{type}:$resource->{resource_code}:$ayah_key");

			unless ($result = $cache->get($cache_key)) {
				my @result = $c->model('DB::Content::Resource')->search({
					'me.language_code' => $resource->{language_code},
					'me.type'          => $resource->{type},
					'me.resource_code' => $resource->{resource_code},
					'ayah.ayah_key'    => $ayah_key,
				}, {
					   join => ['author', { $resource->{type} => 'ayah' }],
					columns => [{ name => 'me.name' }, { text => "$resource->{type}.text" }, { author_name => 'author.name' }, { author_url  => 'author.url' }, { type => 'me.type' }, { resource_code => 'me.resource_code' }, { priority => 'me.priority' }],
				});

				if (@result) {
					$result = $result[0]->{_column_data};

					$result->{author} = {
						name => $result->{author_name},
						 url => $result->{author_url},
					};

					$result->{text} = decode_entities($result->{text} or ''),

					delete $result->{author_name};
					delete $result->{author_url};

					$cache->set($cache_key, $result);
				}
			}

			push @{ $content->{ $ayah_key } }, $result if $result;
		}

		$content->{ $ayah_key } = [ sort { $a->{priority} <=> $b->{priority} } @{ $content->{ $ayah_key } } ] if $content->{ $ayah_key };
	}

	return $content;
}

sub text {
	my ($self, $c, $resource_code, $keys) = (shift, shift, shift, shift);
	my $content = $self->resources($c, [{ language_code => 'ar', type => 'text', resource_code => $resource_code }], $keys);

	$content = { map { $_ => { text => $content->{ $_ }->[0] } } keys %{ $content } };

	return $content;
}

sub words {
	my ($self, $c, $language_code, $keys) = (shift, shift, shift, shift);
	my ($cache, $content) = ($c->cache('memcache'));

	for my $ayah_key (@{ $keys }) {
		my $cache_key = "$language_code:words:$ayah_key";

		unless ($content->{ $ayah_key }->{words} = $cache->get($cache_key)) {
			my @result = $c->model('DB::View::Word4Word')->search(undef, {
				bind => [$language_code, $ayah_key]
			});
			my $result = [ map { $_->{_column_data} } @result ];

			for (@{ $result }) {
				$_->{code} = '&#x'. $_->{code} .';';
				$_->{translation} = encode_entities decode_entities($_->{translation} or '');
			}

			$content->{ $ayah_key }->{words} = $result;

			$cache->set($cache_key, $result);
		}
	}

	return $content;
}

sub images {
	my ($self, $c, $keys) = (shift, shift, shift);
	my ($cache, $content) = ($c->cache('memcache'));

	for my $ayah_key (@{ $keys }) {
		my $cache_key = "images:$ayah_key";

		unless ($content->{ $ayah_key }->{images} = $cache->get($cache_key)) {
			my $alt = $self->resources($c, [{ language_code => 'ar', type => 'text', resource_code => 'simple_clean' }], [$ayah_key]);
			my ($surah, $ayah) = split /:/, $ayah_key, 2;
			my $result = {
				url => 'http://c22506.r6.cf1.rackcdn.com/'. $surah .'_'. $ayah .'.png',
				width => 675,
				alt => $alt->{ $ayah_key }->[0]->{text}
			};

			$content->{ $ayah_key }->{images} = $result;

			$cache->set($cache_key, $result);
		}
	}

	return $content;
}

__PACKAGE__->meta->make_immutable;

1;
