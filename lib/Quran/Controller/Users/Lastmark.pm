# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Users::Lastmark;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/users/base') :PathPart('lastmark') :CaptureArgs(0) {}
sub lastmark :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub lastmark_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	if ($c->user_exists
			and defined $params->{key}
			and defined $params->{context}->{range}
			and defined $params->{context}->{state}
			and $params->{key} =~ /^[\d]{1,3}:[\d]{1,3}$/
			and $params->{context}->{range} =~ /^\/[\d]{1,3}(?:-[\d]{1,3})?$/
			and $params->{context}->{state} =~ /^\//) {
		my $result;
		my $lastmark = $c->model('DB::Account::Lastmark')->find({
			member_id => $c->user->id
		}, { key => 'lastmark_member_id_key' });
		if ($lastmark) {
			if ($lastmark->ayah_key eq $params->{key}
					and $lastmark->context_range eq $params->{context}->{range}
					and $lastmark->context_state eq $params->{context}->{state}) {
				$result->{action} = 'deleted'
					if $lastmark->delete;
			}
			else {
				$result->{action} = 'updated'
					if $lastmark->update({
						     ayah_key => $params->{key},
						context_range => $params->{context}->{range},
						context_state => $params->{context}->{state}
					});
			}
		}
		else {
			$result->{action} = 'created'
				if $lastmark = $c->model('DB::Account::Lastmark')->create({
					    member_id => $c->user->id,
					     ayah_key => $params->{key},
					context_range => $params->{context}->{range},
					context_state => $params->{context}->{state}
				});
		}
		$self->status_ok($c, entity => $result);
	}
	else {
		$self->status_no_content($c);
	}
}

__PACKAGE__->meta->make_immutable;

1;
