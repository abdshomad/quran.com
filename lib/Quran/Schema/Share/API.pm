# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Share::API;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('share.api');
__PACKAGE__->add_columns(
	'network_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'api_key' => { data_type => 'text', is_nullable => 0 },
	'name' => { data_type => 'text', is_nullable => 0 },
	'uri' => { data_type => 'text', is_nullable => 0 },
	'headers' => { data_type => 'text[]', is_nullable => 0, default_value => [['accept-encoding', 'gzip'], ['content-type', 'application/x-www-form-urlencoded']] },
	'scope' => { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('api_key');

__PACKAGE__->belongs_to('network' => 'Quran::Schema::Share::Network', {
	'foreign.network_key' => 'self.network_key'
}, {
	join_type => 'left'
});

__PACKAGE__->has_many('account' => 'Quran::Schema::Account::Share', {
	'foreign.api_key' => 'self.api_key'
}, {
});

__PACKAGE__->many_to_many('member' => 'account', 'member');

1;
