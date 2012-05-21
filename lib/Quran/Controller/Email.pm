package Quran::Controller::Email;
use Moose;
use namespace::autoclean;

use Try::Tiny;
use Email::MIME::Kit;
use Email::Sender::Simple qw/sendmail/;
use Email::Sender::Transport::SMTP::TLS;

BEGIN { extends 'Catalyst::Controller' }

=head1 NAME

Quran::Controller::Email - Catalyst Controller

=head1 DESCRIPTION

Controller for handling email

=head1 METHODS

=cut


=head2 queue

Rather than sending email directly and stalling the application, we insert the
email into a database table and periodically run a cron job that "dequeues"
queued emails i.e. sends them (see ./script/email.dequeue.pl)

Takes "3" arguments. First is a reference to the member/user object, second
is a list (hence the "3") corresponding to the subpath of the email template
(whose root is /root/email/) and the last is a hash ref of extra parameters
to pass to the template.

e.g. $c->controller('Email')->queue($c, $member, qw/user verify/, { days_left => 2, hours_left => 3 });

=cut

sub queue :Private {
	my ($self, $c, $member) = (shift, shift, shift);

	my @path = @_;
	my $params = pop @path if ref $path[scalar @path - 1] eq 'HASH';

	my $template = $c->path_to(qw/root email/, @path);

	my @params;

	if (defined $params) {
		push @params, { key => $_, value => $params->{$_} } for keys %{ $params };
	}

	my $queue = $member->queue->create({
		template => $template,
		   param => \@params
	});
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
