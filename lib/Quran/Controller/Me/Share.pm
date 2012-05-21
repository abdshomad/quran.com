package Quran::Controller::Me::Share;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/me/base') :PathPart('share') :CaptureArgs(0) {}

sub capture :Chained('base') :PathPart('') :CaptureArgs(1) {
	my ($self, $c, $capture) = (shift, shift, shift);
	my ($stash) = ($c->stash);

	$stash->{method} = $capture;

	for my $account ($c->account->share->all) {
		my ($key, $enabled, $authorized) = ($account->api_key, $account->enabled, $account->authorized);

		if ($enabled and $authorized) {
			my $controller = $c->controller('Share::'. ( join '::', map { (uc substr $_, 0, 1) . lc substr $_, 1 } split /_/, $key ));

			$stash->{dispatch}->{ $key } = {
				controller => $controller,
				account => $account,
			};
		}
	}
}

sub method :Chained('capture') :PathPart('') :Args(0) :ActionClass('REST') {}

sub method_POST   { shift->_method(shift) }

sub _method {
	my ($self, $c) = (shift, shift);
	my ($stash, $params) = ($c->stash, $c->request->data);
	my ($method, $dispatch) = ($stash->{method}, $stash->{dispatch});

	for my $key (keys %{ $dispatch }) {
		my ($controller, $account) = ($dispatch->{ $key }->{controller}, $dispatch->{ $key }->{account});

		#next unless $controller->can($method);

		my $result = $controller->$method($c, $account, $params);

		$stash->{rest}->{ $key } = 'ok';
	}

	$c->response->status(200);
}

__PACKAGE__->meta->make_immutable;

1;
