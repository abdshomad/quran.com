# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Share::Network;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('share.network');
__PACKAGE__->add_columns(
	'network_key' => { data_type => 'text', is_nullable => 0 },
	'name' => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('network_key');

__PACKAGE__->has_many('api' => 'Quran::Schema::Share::API', {
	'foreign.network_key' => 'self.network_key'
}, {
});

__PACKAGE__->has_one('auth' => 'Quran::Schema::Share::Auth', {
	'foreign.network_key' => 'self.network_key'
}, {
});

__PACKAGE__->many_to_many('member' => 'account', 'member');

1;
