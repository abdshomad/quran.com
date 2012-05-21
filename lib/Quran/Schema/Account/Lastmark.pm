# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Lastmark;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.lastmark');
__PACKAGE__->add_columns(
	  'lastmark_id' => { data_type => 'integer' =>  is_auto_increment => 1, is_nullable => 0, sequence => 'lastmark_lastmark_id_seq' =>  },
	    'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
       'ayah_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
  'context_range' => { data_type => 'text', is_nullable => 0 },
  'context_state' => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('lastmark_id');
__PACKAGE__->add_unique_constraint('lastmark_member_id_key', ['member_id']);

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
 { 'foreign.ayah_key' => 'self.ayah_key' },
 { is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
