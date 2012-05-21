# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran;

use Moose;
use namespace::autoclean;

use Catalyst::Runtime 5.80;

use Catalyst qw/
	-Debug
	ConfigLoader::Multi
	StackTrace
	Static::Simple
	Authentication
	Authorization::Roles
	Cache
	Session
	Session::State::Cookie
	Unicode::Encoding
	+Quran::Plugin::Account
	+Quran::Plugin::I18N
	+Quran::Plugin::I18N::Language
	+Quran::Plugin::I18N::Lexicon
	+Quran::Plugin::I18N::Host
	+Quran::Plugin::Config::Roles
	+Quran::Plugin::UTF8
	+Quran::Plugin::Session
	+Quran::Plugin::Session::Store::Cache
/;

use CatalystX::RoleApplicator;

extends 'Catalyst';

__PACKAGE__->apply_request_class_roles qw/Catalyst::TraitFor::Request::BrowserDetect/;

our $VERSION = '1.4321101.001'; # i.e. target date to production, e.g. Ramadan (09), day 1 (01), year 1432 rev. 001

my $conf = __PACKAGE__->path_to('conf');

system($conf ."/load.pl");

__PACKAGE__->config( name => 'Quran' );
__PACKAGE__->config('Plugin::ConfigLoader' => { file => $conf });

__PACKAGE__->config(
	'Plugin::Authentication' => {
		default_realm => 'members',
		realms => {
			members => {
				credential => {
					class => 'Password',
					password_field => 'password',
					password_type => 'hashed',
					password_hash_type => 'SHA-1'
				},
				store => {
					class => 'DBIx::Class',
					user_class => 'DB::Account::Member',
					role_relation => 'roles',
					role_field => 'name'
				}
			}
		}
	},
	'Plugin::Cache' => {
		backends => {
			default => {
				namespace => 'quran',
				class => 'CHI',
				driver => 'Memcached::Fast',
				servers => ['127.0.0.1:11211'],
				compress_threshold => 1000_000,
				nowait => 1,
			},
			berkeleydb => {
				namespace => 'quran',
				class => 'CHI',
				driver => 'BerkeleyDB',
				root_dir => '/tmp/quran/cache/berkeleydb',
			},
			fastmmap => {
				namespace => 'quran',
				class => 'CHI',
				driver => 'FastMmap',
				root_dir => '/tmp/quran/cache/fastmmap',
				cache_size => '16m'
			}
		},
		profiles => {
			memcache => { backend => 'default' },
			view => { backend => 'berkeleydb' },
			session => { backend => 'fastmmap' },
		}
	},
	'Plugin::Session' => {
		expires => 604800, # 1 week
		profile => 'session',
	},
);

__PACKAGE__->setup();

__PACKAGE__->config->{paypal} = __PACKAGE__->config->{paypal}->{sandbox}
	if __PACKAGE__->debug;

sub setting {
	my $self = shift;
	my $setting = $self->controller('Setting')->_ref($self);
	return $setting if not defined $_[0];
	if (ref \$_[0] eq 'SCALAR') {
		return $setting->get(@_) if not $_[1];
		return $setting->set(@_);
	}
	return;
}

sub memcache {
	my $self = shift;
	my $memcache = $self->controller('Memcache');
	return $memcache if not defined $_[0];
	if (ref \$_[0] eq 'SCALAR') {
		return $memcache->get(@_) if not $_[1];
		return $memcache->set(@_);
	}
	return;
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash

=cut

1;
