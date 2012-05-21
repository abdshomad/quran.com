# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Share::Auth;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('share.auth');
__PACKAGE__->add_columns(
	'network_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'key' => { data_type => 'text', is_nullable => 0 },
	'secret' => { data_type => 'text', is_nullable => 0 },
	'realm' => { data_type => 'text', is_nullable => 1 },
	'uri_request' => { data_type => 'text', is_nullable => 1 },
	'uri_authorize' => { data_type => 'text', is_nullable => 0 },
	'uri_access' => { data_type => 'text', is_nullable => 0 },
	'version' => { data_type => 'integer', default_value => 2, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('network_key');

__PACKAGE__->belongs_to('network' => 'Quran::Schema::Share::Network', {
	'foreign.network_key' => 'self.network_key'
}, {
	join_type => 'left'
});

1;
