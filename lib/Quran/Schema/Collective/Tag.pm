# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Collective::Tag;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('collective.tag');
__PACKAGE__->add_columns(
	'tag_id' => { data_type => 'integer' => is_auto_increment => 1, is_nullable => 0, sequence => 'tag_tag_id_seq' },
	 'value' => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('tag_id');
__PACKAGE__->add_unique_constraint('tag_value_key', ['value']);

__PACKAGE__->has_many('account' => 'Quran::Schema::Account::Tag',
	{ 'foreign.tag_id' => 'self.tag_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->many_to_many('member' => 'account', 'member');
__PACKAGE__->many_to_many('ayah' => 'account', 'ayah');

1;
