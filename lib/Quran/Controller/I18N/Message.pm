package Quran::Controller::I18N::Message;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub message :Path('/i18n/message') :ActionClass('REST') {}

sub message_POST {
	my ($self, $c) = @_;
	my $params = $c->request->data;
	my $result;

	if ($c->check_user_roles(qw/developer/) and not $c->config->{i18n}->{lexicon}->{ $c->config->{i18n}->{languages}->{default} }->{ $params->{key} }) {
		$c->config->{i18n}->{lexicon}->{ $_ }->{ $params->{key} } = $params->{key} for @{ $c->config->{i18n}->{languages}->{installed}->{array} };
		$c->model('DB::I18N::Message')->find_or_create({
			key => $params->{key}
		});
		$result->{action} = 'created';
	}
	else {
		$result->{action} = 'none';
	}

	$self->status_ok($c, entity => $result);
}

__PACKAGE__->meta->make_immutable;

1;
