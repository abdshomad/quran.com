# vim: ts=2 sw=2 noexpandtab
package Quran::Model::DB;

use strict;
use base 'Catalyst::Model::DBIC::Schema';

__PACKAGE__->config(
	schema_class => 'Quran::Schema',
	connect_info => {
		dsn => Quran->config->{database}->{dsn},
		user => Quran->config->{database}->{user},
		password => Quran->config->{database}->{password},
		pg_bool_tf => 0,
		pg_enable_utf8 => 1,
		AutoCommit => 1,
		RaiseError => 1
	}
);

1;
