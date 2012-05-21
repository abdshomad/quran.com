# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Users::Bookmark;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/users/base') :PathPart('bookmark') :CaptureArgs(0) {}
sub bookmark :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub bookmark_POST {
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
		my $bookmark = $c->model('DB::Account::Bookmark')->find({
			member_id => $c->user->id,
			 ayah_key => $params->{key}
		}, { key => 'bookmark_member_id_ayah_key' });
		if ($bookmark) {
			if ($bookmark->context_range eq $params->{context}->{range} and $bookmark->context_state eq $params->{context}->{state}) {
				$result->{action} = 'deleted'
					if $bookmark->delete;
			}
			else {
				$result->{action} = 'updated'
					if $bookmark->update({
						context_range => $params->{context}->{range},
						context_state => $params->{context}->{state}
					});
			}
		}
		else {
			$result->{action} = 'created'
				if $bookmark = $c->model('DB::Account::Bookmark')->create({
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
