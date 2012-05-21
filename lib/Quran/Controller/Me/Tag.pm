# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Me::Tag;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/me/base') :PathPart('tag') :CaptureArgs(0) {}
sub tag :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

=cut
	create an array of tags for autocompletion
	array of tags consists of (and ordered by respectively)
	- all tags used by this user in this surah before
	- all tags used by this user before
	- all tags used by other users on this ayah before
	- all tags used by other users in this surah before
	- all tags used by other users before
	then grep it down to unique
=cut

sub tag_POST {
	my ($self, $c) = (shift, shift);
	my ($params, $result) = ($c->request->data);

	$c->log->debug('DATA '. $params .' FOO '. $params->{term});

	$result = $self->handle_POST($c, $params);

	$self->status_bad_request($c, message => 'params') and return
		unless $result;

	#my $rand = rand(); my $time = 2 * $rand; sleep $time;

	$self->status_ok($c, entity => $result);
}

sub handle_POST :Private {
	my ($self, $c, $params) = (shift, shift, shift);
	my ($member_id, $ayah_key, $term) = ($c->stash->{member_id}, $params->{key}, $self->_term($params->{term}));
	my ($surah_id, $ayah_num) = split /:/, $ayah_key;
	my ($result, %result, @result);

	($result) = $c->model('DB::View::AutoComplete::Tag')->search(undef, {
		bind => [$member_id, $surah_id, $ayah_num, $term]
	});

	$result = ($result->get_column('tags') or []);


	for (@{ $result }) {
		unless ($result{ $_ }) {
			push @result, $_;
			$result{ $_ } = 1;
		}
	}

	$result = [ map {
		my ($suggest, $label);

		$suggest = $self->_suggest($term, $_);
		$label = $self->_label($_, $suggest);

		{
			type => 'tag', # three types: tag, query, and link
			value => $_,
			term => $term,
			suggest => $suggest,
			label => $label
		}
	} @result ];

	return $result;
}

sub _term {
	my ($self, $term) = @_;

	return pop @{ $self->_split($self->_trim($term)) };
}

sub _split {
	my ($self, $term) = @_;

	return [ split /\s*,\s*/, $term ];
}

sub _trim {
	my ($self, $term) = @_;

	$term =~ s/^\s*//;
	$term =~ s/\s*$//;
	$term =~ s/\s*,\s*/, /g;
	$term =~ s/\s+/ /g;
	$term =~ s/[,\s]+$//;
	$term =~ s/^[,\s]+//;

	return $term;
}

sub _suggest {
	my ($self, $term, $value) = @_;

	$value =~ s/^$term//;

	return $value;
}

sub _label {
	my ($self, $tag, $suggest) = @_;

	$tag =~ s/($suggest)$/<em>$1<\/em>/;

	return $tag;
}

sub tag_PUT {
	my ($self, $c) = (shift, shift);
	my ($params, $result) = ($c->request->data);

	$result = $self->handle_PUT($c, $params);

	$self->status_bad_request($c, message => 'params') and return
		unless $result;

	$self->status_ok($c, entity => $result);
}

sub handle_PUT :Private {
	my ($self, $c, $params) = (shift, shift, shift);
	my ($member_id, $tags, $ayah_key, $result) = ($c->stash->{member_id}, $params->{tags}, $params->{key});

	return 0
		unless defined $tags
		   and defined $ayah_key
		   and $c->model('DB::Quran::Ayah')->find({ ayah_key => $ayah_key }, { key => 'primary', columns => 'ayah_key' });

	$tags = { map { lc $_ => undef } split /\W*,\W*/, $tags };

	if (my $set = $c->model('DB::Account::Tag')->search({ ayah_key => $ayah_key, member_id => $member_id })) {
		$set->delete;
		$result->{action} = 'deleted';
	}

	for my $value (keys %{ $tags }) {
		if (my $tag = $c->model('DB::Collective::Tag')->find_or_create({ value => $value }, { key => 'tag_value_key' })) {
			my $tag_id = $tag->get_column('tag_id');

			if ($c->model('DB::Account::Tag')->find_or_create({ tag_id => $tag_id, ayah_key => $ayah_key, member_id => $member_id }, { key => 'primary' })) {
				$tags->{ $value } = $tag_id;
			}
		}
	}

	$tags = [ grep { defined $tags->{ $_ } } keys %{ $tags } ];

	$result->{action} = 'updated' if scalar @{ $tags };
	$result->{key} = $ayah_key;
	$result->{tags} = $tags;

	return $result;
}

__PACKAGE__->meta->make_immutable;

1;
