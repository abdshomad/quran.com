package Quran::Model::Options;
use Moose;
use namespace::autoclean;

extends 'Catalyst::Model';

__PACKAGE__->config({
	options => {
		quran => {
			 words => 1,
			images => 1,
			  text => undef
		},
	},
});

sub options {
	my ($self, $c) = (shift, shift);

	my $stash = $c->stash;
	my $options;

	unless (defined $self->{options}->{quran}->{text}) {
		my @set = $c->model('DB::Content::Resource')->search({
			'me.type'          => 'text',
			'me.language_code' => 'ar'
		}, {
			columns => [
				{ resource_code => 'me.resource_code' },
				{ name => 'me.name' },
			],
			order_by => [{ -desc => 'me.default' }, { -asc => 'me.priority' }, { -asc => 'me.resource_code' }]
		});

		$self->{options}->{quran}->{text} = [ map { {
			resource_code => $_->get_column('resource_code'),
			name => $_->get_column('name'),
		} } @set ];
	}

	$options->{quran} = $self->{options}->{quran};

	unless ($options->{resources} = $c->memcache("options:resources:$stash->{language}->{language_code}")) {
		if ($stash->{language}->{language_code} eq 'ar') {
			my @set = $c->model('DB::Content::Resource')->search({
				'me.type'          => 'tafsir',
				'me.language_code' => 'ar'
			}, {
				columns => [
					{ resource_code => 'me.resource_code' },
					{ name => 'me.name' }
				],
				order_by => [{ -desc => 'me.default' }, { -asc => 'me.priority' }, { -asc => 'me.resource_code' }]
			});
			$options->{resources}->{tafsir} = [ map { {
				resource_code => $_->get_column('resource_code'),
				name => $_->get_column('name'),
			} } @set ];
		}
		else {
			my @set = $c->model('DB::Content::Resource')->search({
				'me.type'          => 'translation',
				'me.language_code' => $stash->{language}->{language_code}
			}, {
				join     => 'author',
				columns  => [
					{ resource_code => 'me.resource_code' },
					{          name => 'me.name'          },
					{   author_name => 'author.name'      },
					{   author_url  => 'author.url'       }
				],
				order_by => [{ -desc => 'me.default' }, { -asc => 'me.priority' }, { -asc => 'me.resource_code' }]
			});

			$options->{resources}->{translation} = [ map { {
				resource_code => $_->get_column('resource_code'),
				name          => $_->get_column('name'),
				author => {
					name => $_->get_column('author_name'),
					 url => $_->get_column('author_url'),
				}
			} } @set ];

			@set = $c->model('DB::Content::Resource')->search({
				'me.type'          => 'transliteration',
				'me.language_code' => $stash->{language}->{language_code}
			}, {
				join     => 'author',
				columns  => [
					{ resource_code => 'me.resource_code' },
					{          name => 'me.name'          },
					{   author_name => 'author.name'      },
					{   author_url  => 'author.url'       }
				],
				order_by => [{ -desc => 'me.default' }, { -asc => 'me.priority' }, { -asc => 'me.resource_code' }]
			});

			$options->{resources}->{transliteration} = [ map { {
				resource_code => $_->get_column('resource_code'),
				name          => $_->get_column('name'),
				author => {
					name => $_->get_column('author_name'),
					 url => $_->get_column('author_url'),
				}
			} } @set ];
		}
		$c->memcache("options:resources:$stash->{language}->{language_code}", $options->{resources});
	}

	return $options;
}

__PACKAGE__->meta->make_immutable;

1;
