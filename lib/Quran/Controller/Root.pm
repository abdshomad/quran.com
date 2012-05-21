# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Root;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

__PACKAGE__->config(namespace => '');

# most specific begin gets run
sub begin :Private {
	my ($self, $c) = @_;
	my ($stash, $session, $browser) = ($c->stash, $c->session, $c->request->browser);

	unless (defined $self->{network}) {
		$self->{network} = $c->memcache->search('network', {
			model => 'DB::Network::Site',
			where => {
				'me.active' => 1
			},
			attrs => {
				columns => [qw/label title url labs new/],
				order_by => { -asc => 'position' }
			}
		});
	}

	$stash->{network} = $self->{network};
	$stash->{language} = $c->i18n->language($c);
	$stash->{lexicon} = $c->i18n->lexicon($c);

	unless (defined $session->{_version} and $session->{_version} eq $Quran::VERSION) {
		my $default = $c->model('Session')->default($c);
		$c->session($default);
	}
	else {
		unless ($stash->{language}->{language_code} eq 'ar' or defined $session->{content}->{resources}->{ $stash->{language}->{language_code} }) {
			my $default = $c->model('Session')->default($c);
			$session->{content}->{resources}->{ $stash->{language}->{language_code} } = $default->{content}->{resources}->{ $stash->{language}->{language_code} };
		}
	}

	$stash->{ua} =
		($browser->mobile ? 'mobile-' : '') . (
			($browser->mozilla or $browser->gecko or $browser->firefox) ? 'mozilla' :
			($browser->chrome or $browser->safari or $browser->mobile_safari or $browser->konqueror) ? 'webkit' :
			($browser->opera) ? 'opera' :
			($browser->ie) ? 'msie' : 'unknown'
		);
}

# auto run from least to most specific, return 0 to jump to end and finish or die to jump to finish
sub auto :Private {
	my ($self, $c) = @_;
	my ($stash, $session, $browser) = ($c->stash, $c->session, $c->request->browser);

	return 1;
}

# most specific end is run
sub end : ActionClass('RenderView') {
	my ($self, $c) = @_;
	my ($stash, $session, $browser) = ($c->stash, $c->session, $c->request->browser);

	$stash->{json}->{session} = { map { $_ => $session->{$_}; } grep { not /^_/ } keys %{ $session } };

	my $not = {};

	for (keys %{ $stash }) {
		next if $_ eq 'json';
		next if $not->{ $_ };
		$stash->{json}->{ $_ } = $stash->{ $_ };
	}
}

sub default :Path {
	my ( $self, $c ) = @_;
	$c->response->body( 'Page not found' );
	$c->response->status(404);
}

sub index :Path :Args(0) {
	my ($self, $c) = @_;
	$c->response->redirect('/1/');
}

sub base :Chained('/') :PathPart('') :CaptureArgs(0) {
	my ($self, $c) = @_;
	my ($stash, $session, $browser) = ($c->stash, $c->session, $c->request->browser);

	unless (defined $self->{surahs}) {
		$self->{surahs} = $c->memcache->search('surahs', {
			model => 'DB::Quran::Surah',
			where => {
				'ayah.ayah_num' => 1
			},
			attrs => {
				join     => 'ayah',
				order_by => { -asc => 'me.surah_id' },
			}
		});
	}

	$stash->{surahs} = $self->{surahs};
	$stash->{action} = ''. $c->action .'';
	$stash->{namespace} = $c->namespace;
}

__PACKAGE__->meta->make_immutable;

1;
