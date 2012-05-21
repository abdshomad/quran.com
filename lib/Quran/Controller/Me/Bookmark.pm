# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Me::Bookmark;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/me/base') :PathPart('bookmark') :CaptureArgs(0) {}
sub bookmark :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub bookmark_POST {
	my ($self, $c) = (shift, shift);
	my ($params, $result) = ($c->request->data);

	$result = $self->handle($c, $params);

	$self->status_bad_request($c, message => 'params') and return
		unless $result;

	$self->status_ok($c, entity => $result);
}

sub handle :Private {
	my ($self, $c, $params) = (shift, shift, shift);
	my ($member_id, $ayah_key, $context, $action, $tags, $bookmark, $result) = ($c->stash->{member_id}, $params->{key}, $params->{context}, $params->{action}, $params->{tags});

	return 0
		unless defined $ayah_key
		   and defined $context->{range}
		   and defined $context->{state}
		   and $ayah_key =~ /^[\d]{1,3}:[\d]{1,3}$/
		   and $context->{range} =~ /^\/[\d]{1,3}(?:-[\d]{1,3})?$/
		   and $context->{state} =~ /^\//;

	$bookmark = $c->model('DB::Account::Bookmark')->find({ member_id => $member_id, ayah_key => $ayah_key }, { key => 'bookmark_member_id_ayah_key' });

	if ($action eq 'delete') {
		$bookmark->delete if defined $bookmark;
		$result->{action} = 'deleted';
		return $result;
	}
	else {
		if (defined $bookmark) {
			$bookmark->update({ context_range => $context->{range}, context_state => $context->{state} });
			$result->{action} = 'updated';
		}
		else {
			$bookmark = $c->model('DB::Account::Bookmark')->create({
						member_id => $member_id,
						 ayah_key => $ayah_key,
				context_range => $context->{range},
				context_state => $context->{state}
			});
			$result->{action} = 'created' if defined $bookmark;
		}
	}

	if (defined $tags and $result->{action} eq 'created' or $result->{action} eq 'updated') {
		if (my $_result = $c->controller('Me::Tag')->handle_PUT($c, $params)) {
			$result->{tags} = $_result->{tags};
		}
	}

	$result->{key} = $ayah_key;

	return $result;
}

__PACKAGE__->meta->make_immutable;

1;
