package Quran::Controller::Me::Share::Auth;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/me/share/base') :PathPart('auth') :CaptureArgs(0) {}

sub root :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}
sub root_POST {
	my ($self, $c) = (shift, shift);

	my $result;

	for ($c->account->share->all) {
		my ($enabled, $authorized, $detail) = ($_->enabled, $_->authorized);

		if ($enabled) {
			$result->{ $_->api_key } = { enabled => $enabled, authorized => $authorized };

			unless ($authorized) {
				if ($detail) {
					my $more = $result->{ $_->api_key };

					$more->{ $_ } = $detail->{ $_ } for keys %{ $detail };
				}
			}
		}
	}

	$self->status_ok($c, entity => $result);
}

sub capture :Chained('/me/share/base') :PathPart('auth') :CaptureArgs(1) {
	my ($self, $c, $key) = (shift, shift, shift);
	my ($stash, $model, $controller) = ($c->stash);

	$model = $c->account->share->find_or_create({ api_key => $key }, { key => 'primary' });

	return $c->detach('/default')
		unless $model;

	$controller = $c->controller('Share::'. ( join '::', map { (uc substr $_, 0, 1) . lc substr $_, 1 } split /_/, $key ));

	return $c->detach('/default')
		unless $controller;

	$stash->{model} = $model;
	$stash->{controller} = $controller;
}

sub debug :Chained('capture') :PathPart('') :Args(0) :ActionClass('REST') {}
sub debug_GET {
	my ($self, $c) = (shift, shift);
	my ($stash) = ($c->stash);

	return $self->status_ok($c, entity => {
		account => $stash->{account},
		model => $stash->{model},
		key => $stash->{key},
	});
}

# https://www.facebook.com/dialog/oauth?client_id=155032717920714&redirect_uri=http%3A%2F%2Fquran.com%2Fme%2Fshare%2Fauth%2Ffacebook%2Freturn&scope=publish_stream&response_type=token&display=popup
sub redirect :Chained('capture') :PathPart('redirect') :Args(0) {
	my ($self, $c) = (shift, shift);
	my ($stash, $session) = ($c->stash, $c->session);
	my ($controller, $model) = ($stash->{controller}, $stash->{model});

	my $result = $controller->auth->redirect($session);

	return $c->response->redirect( $result->{uri} );
}

sub return :Chained('capture') :PathPart('return') :Args(0) :ActionClass('REST') {}
sub return_GET {
	my ($self, $c) = (shift, shift);
	my ($stash, $session, $params) = ($c->stash, $c->session, $c->request->params);
	my ($controller, $model) = ($stash->{controller}, $stash->{model});

	my $result = $controller->auth->return($params, $model, $session);
	# TODO ^ add this to task queue instead of doing it directly

	my $key = $controller->api->id;
	my $path = 'quran.ui.content.ayahTools.share.auth';
	my $script =<<END
		var root;

		if (window.top && window.top.quran)
			root = window.top;
		else
		if (window.opener && window.opener.quran)
			root = window.opener;
END
	;
	my $method;

	if ($params->{error} or $params->{denied}) {
		$method = 'cancel';
	}
	else {
		$method = 'finish';
	}

	$script .=<<END
		if (root)
			root.$path.$method("$key");
END
	;

	$c->response->content_type('text/html');
	$c->response->code(200);
	$c->response->body("<script type='text/javascript'>\n$script</script>");
}

sub refresh :Chained('capture') :PathPart('refresh') :Args(0) :ActionClass('REST') {}
sub refresh_POST {
	my ($self, $c) = (shift, shift);
	my ($stash) = ($c->stash);
	my ($controller, $model) = ($stash->{controller}, $stash->{model});

	my $result = $controller->auth->refresh($model);

	return $self->status_ok($c, entity => { msg => 'ok' });
}

__PACKAGE__->meta->make_immutable;

1;
