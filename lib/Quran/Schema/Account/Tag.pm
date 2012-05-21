# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Tag;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.tag');
__PACKAGE__->add_columns(
	   'tag_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	 'ayah_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('tag_id', 'member_id', 'ayah_key');

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
 { 'foreign.member_id' => 'self.member_id' },
 { is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
 { 'foreign.ayah_key' => 'self.ayah_key' },
 { is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('collective' => 'Quran::Schema::Collective::Tag',
 { 'foreign.tag_id' => 'self.tag_id' },
 { is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
