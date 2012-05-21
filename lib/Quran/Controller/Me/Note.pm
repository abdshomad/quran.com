# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Me::Note;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/me/base') :PathPart('note') :CaptureArgs(0) {}
sub index :Chained('base') :PathPart('') :Args(0) {
	my ($self, $c) = @_;
	my $p = $c->request->params;

	if ($c->request->method eq 'POST' and $c->user_exists and defined $p->{ayah} and $p->{ayah} =~ /^[\d]+:[\d]+$/ and defined $p->{body}) {
		$self->post($c, $p);
	}
	else {
		$c->response->body('Matched Quran::Controller::Me::Note in Account::Note.');
	}
}

sub post :Private {
	my ($self, $c, $p) = @_;
	my $ayah = $c->model('DB::Quran::Ayah')->find({ ayah_key => $p->{ayah} });
	$c->stash->{current_view} = 'JSON';
	$c->stash->{json_result} = undef;
	if ($ayah) {
		$c->stash->{json_result} = 'created' if (
			$c->model('DB::Account::Note')->create({
				member_id => $c->user->id,
				ayah_key   => $ayah->ayah_key,
				subject    => $p->{subject} ? $p->{subject} : undef,
				body       => $p->{body},
				public     => $p->{public} ? 1 : 0,
				feedback   => ($p->{public} and $p->{feedback}) ? 1 : 0
			})
		);
	}
}

__PACKAGE__->meta->make_immutable;

1;
