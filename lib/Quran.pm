# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran;

use Moose;
use namespace::autoclean;

use Catalyst::Runtime 5.80032;

use Catalyst 5.80032 qw/
	ConfigLoader
	Static::Simple
	Authentication
	Authorization::Roles
	Cache
	Session
	Session::State::Cookie
	Unicode::Encoding
	+Quran::Plugin::I18N
	+Quran::Plugin::I18N::Language
	+Quran::Plugin::I18N::Lexicon
	+Quran::Plugin::I18N::Path
	+Quran::Plugin::Config::Roles
	+Quran::Plugin::UTF8
	+Quran::Plugin::Session
	+Quran::Plugin::Session::Store::Cache
/;

use CatalystX::RoleApplicator;

extends 'Catalyst';

__PACKAGE__->apply_request_class_roles ('Catalyst::TraitFor::Request::BrowserDetect');

our $VERSION = '1.4320901'; # i.e. target date to production is Ramadan (09), day 1 (01), year 1432 rev. 001

__PACKAGE__->config(
	name => 'Quran',
	encoding => 'UTF-8',
	'Plugin::Authentication' => {
		default_realm => 'quran.com',
		realms => {
			'quran.com' => {
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
	default_view => 'Mason',
	disable_component_resolution_regex_fallback => 1,
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

__PACKAGE__->config->{paypal} = __PACKAGE__->config->{paypal}->{sandbox} if __PACKAGE__->debug;

# TODO :
# refactor setting and memcache below into models

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

1;
