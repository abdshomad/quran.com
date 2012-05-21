package Quran::Plugin::Session::Store::Cache;

use strict;
use warnings;

use base qw/
	Class::Data::Inheritable
	Catalyst::Plugin::Session::Store/;

use MIME::Base64;
use MRO::Compat;
use Storable;

our $VERSION = "0.01";

my $config;

__PACKAGE__->mk_classdata('_session_storage');

sub get_session_data {
	my ($c, $key) = @_;
	my $data = ( $c->_session_storage->get($key) or $c->session );
	if ($key =~ /^session:/ and ($c->user_exists or (defined $data->{__user} and defined $data->{__user_realm}))) {
		if ($c->user_exists or $c->auth_realms->{ $data->{__user_realm} }->restore_user($c, $data->{__user})) {
			my $_data = $c->user->session->get_column('data');
			if (defined $_data) {
				$_data = Storable::thaw(MIME::Base64::decode($_data));
				$data = $_data if defined $_data and defined $_data->{_version} and $_data->{_version} eq $Quran::VERSION;
			}
		}
	}
	return $data;
}

sub store_session_data {
	my ($c, $key, $data) = @_;
	if ($key =~ /^session:/ and $c->user_exists) {
		if ($c->action->private_path eq '/sign/in/index') {
			my $_data = $c->get_session_data($key);
			$_data->{__user} = $data->{__user};
			$_data->{__user_realm} = $data->{__user_realm};
			$data = $_data;
		}
		my $data = MIME::Base64::encode(Storable::nfreeze($data or {}));
		$c->user->session->update({ data => $data });
	}
	return $c->_session_storage->set($key, $data, $config->{expires});
}

sub delete_session_data {
	my ($c, $key) = @_;
	return $c->_session_storage->remove($key);
}

sub delete_expired_sessions {}

sub setup_session {
	my $c = shift;
	$config = $c->_session_plugin_config;
	$c->_session_storage($c->cache($config->{profile}));
	$c->maybe::next::method(@_);
}

1;
