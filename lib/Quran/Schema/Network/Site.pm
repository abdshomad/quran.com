# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Network::Site;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('network.site');
__PACKAGE__->add_columns(
	'site_id'  => { data_type => 'integer', is_nullable => 0 },
	'label'    => { data_type => 'text', is_nullable => 1 },
	'title'    => { data_type => 'text', is_nullable => 1 },
	'url'      => { data_type => 'text', is_nullable => 1 },
	'position' => { data_type => 'integer', is_nullable => 1 },
	'active'   => { data_type => 'boolean', is_nullable => 1 },
	'labs'     => { data_type => 'boolean', is_nullable => 1 },
	'new'      => { data_type => 'boolean', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('site_id');

1;
