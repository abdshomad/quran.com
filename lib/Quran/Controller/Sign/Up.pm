# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Sign::Up;
use Moose;
use namespace::autoclean;
use Digest::SHA qw/sha1_hex/;
use Email::Valid;
use Data::Password::Entropy;
use Regexp::Common qw/profanity/;
use Data::UUID;

BEGIN { extends 'Catalyst::Controller::REST' }

sub validate :Local :Args(0) :ActionClass('REST') {}
sub validate_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	my $result = $self->validate_params($c, $params);
	return $self->status_ok($c, entity => $result);
}

sub validate_params :Private {
	my ($self, $c, $params) = @_;

	return { passed => [], exception => {
		  field => 'name',
		message => 'Please provide your full name.'
	} } unless defined $params->{name} and length $params->{name} >= 3;
	return { passed => [], exception => {
		  field => 'name',
		message => 'Profanity detected.'
	} } unless $params->{name} !~ $RE{profanity};
	return { passed => [qw/name/], exception => {
		  field => 'email',
		message => 'Please provide your email address.'
	} } unless defined $params->{email} and $params->{email} ne '';
	return { passed => [qw/name/], exception => {
		  field => 'email',
		message => 'Please provide a valid email address.'
	} } unless Email::Valid->address( -address => $params->{email}, -tldcheck => 1 ) and $params->{email} !~ /\s/;
	return { passed => [qw/name/], exception => {
		  field => 'email',
		message => 'This email address has already been registered, please use a different one.'
	} } unless $self->is_available($c, { email => $params->{email} });
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Please provide a login name.'
	} } unless defined $params->{login} and $params->{login} ne '';
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Allowed characters are alphanumeric (a-z, 0-9), \'_\' and \'.\'.'
	} } unless $params->{login} =~ /^[\w.]+$/;
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Please use at least a few letters (a-z) in your login name.'
	} } unless $params->{login} =~ /[^\d.]/;
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Please provide a login name at least four (4) characters in length.'
	} } unless length $params->{login} >= 4;
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Please provide a login name no longer than 25 characters in length.'
	} } unless length $params->{login} <= 25;
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'Profanity detected.'
	} } unless $params->{login} !~ $RE{profanity};
	return { passed => [qw/name email/], exception => {
		  field => 'login',
		message => 'This login name has already been registered, please use a different one.'
	} } unless $self->is_available($c, { login => $params->{login} });
	return { passed => [qw/name email login/], exception => {
		  field => 'password',
		message => 'Please provide a password.'
	} } unless defined $params->{password} and $params->{password} ne '';
	return { passed => [qw/name email login/], exception => {
		  field => 'password',
		message => 'Please provide a password at least six (5) characters in length.'
	} } unless length $params->{password} >= 5;
	return { passed => [qw/name email login/], exception => {
		  field => 'password',
		message => 'Password too weak. Try lengthening it, adding numbers, or varying cAsE.'
	} } unless password_entropy $params->{password} >= 25;
	return { passed => [qw/name email login password/], exception => {
		  field => 'confirm',
		message => 'Please confirm your password.'
	} } unless defined $params->{confirm} and $params->{confirm} ne '';
	return { passed => [qw/name email login password/], exception => {
		  field => 'confirm',
		message => 'Passwords do not match.'
	} } unless $params->{password} eq $params->{confirm};

	return { token => $self->params_token($c, $params) };
}

sub create :Local :Args(0) :ActionClass('REST') {}
sub create_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	if (my $member = $self->create_member($c, $params)) {
		$self->email($c, $member);
		return $self->status_ok($c, entity => { created => 1 });
	}
	return $self->status_ok($c, entity => { created => 0 });
}

sub create_member :Private {
	my ($self, $c, $params) = @_;

	return unless $params->{token} eq $self->params_token($c, $params);

	my $token = $self->member_token($c, $params->{token});
	my $password = sha1_hex($params->{password});
	for (qw/name email login/) {
		$params->{$_} =~ s/^\s+//;
		$params->{$_} =~ s/\s+$//;
	}
	my $login = lc($params->{login});
	my $member = $c->model('DB::Account::Member')->create({
	     name => $params->{name},
	    email => $params->{email},
	    login => $login,
	    token => $token,
	 password => $password
	});

	if ($member) {
		if (
			$c->model('DB::Account::MemberRole')->create({ member_id => $member->id, role_id => $c->config->{roles}->{user} }) and
			$c->model('DB::Account::Session')->create({ member_id => $member->id })
		) {
			$c->set_authenticated($c->find_user({ member_id => $member->id }));
			return $member;
		} else { $member->delete; }
	}
}

sub purchase :Local :Args(0) :ActionClass('REST') {}
sub purchase_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	if (my $member = $self->create_purchased($c, $params)) {
		$self->email($c, $member);
		return $self->status_ok($c, entity => { purchased => 1 });
	}
	return $self->status_ok($c, entity => { purchased => 0 });
}

sub create_purchased :Private {
	my ($self, $c, $params) = @_;
	my $member = $self->create_member($c, $params);
	if ($member) {
		if ($c->controller('Sign::Up::Payment')->finish($c, $params, $member)) {
			return $member;
		}
		else { $member->delete; }
	}
}

sub params_token :Private {
	my ($self, $c, $params) = (@_);
	my $_params = { map { $_ => $params->{$_} } keys %{ $params } };
	delete $_params->{token};
	delete $_params->{pp_token};
	delete $_params->{pp_PayerID};
	my $uuid = new Data::UUID;
	return $uuid->to_b64string($uuid->create_from_name_b64(NameSpace_OID, join ':', map { "$_:$_params->{$_}" } sort keys %{ $_params }));
}

sub member_token :Private {
	my ($self, $c, $token) = (@_);
	my $uuid = new Data::UUID;
	return $uuid->to_b64string($uuid->create_from_name_b64(NameSpace_OID, $token));
}

sub email :Private {
	my ($self, $c, $member) = @_;
	$c->controller('Email')->queue($c, $member, qw/user verify/);
}

sub is_available :Private {
	my ($self, $c, $params) = @_;

	if ($params->{login}) {
		return $c->model('DB::Account::Member')->find({ login => lc($params->{login}) }) ? 0 : 1;
	}
	if ($params->{email}) {
		return $c->model('DB::Account::Member')->find({ email => $params->{email} }) ? 0 : 1;
	}
}

__PACKAGE__->meta->make_immutable;

1;
