# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Audio::Reciter;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('audio.reciter');

__PACKAGE__->add_columns(
	'reciter_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'audio.reciter_reciter_id_seq' },
	'path'    =>  { data_type => 'text', is_nullable => 0 },
	'arabic'  => { data_type => 'text', is_nullable => 0 },
	'english' => { data_type => 'text', is_nullable => 0 },
	'url' => { data_type => 'text[]', is_nullable => 1 },
	'priority' => { data_type => 'integer', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('reciter_id');
__PACKAGE__->add_unique_constraint('reciter_arabic_key', ['arabic']);
__PACKAGE__->add_unique_constraint('reciter_english_key', ['english']);
__PACKAGE__->add_unique_constraint('reciter_path_key', ['path']);

1;
