# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::Source;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.source');

__PACKAGE__->add_columns(
	'source_id', { data_type => 'integer', is_nullable => 0 },
	'name',      { data_type => 'text', is_nullable => 0 },
	'url',       { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('source_id');

__PACKAGE__->has_many('resource' => 'Quran::Schema::Content::Resource',
	{ 'foreign.source_id' => 'self.source_id' });

1;
