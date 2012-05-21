package Quran::Schema::I18N::Language;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('i18n.language');

__PACKAGE__->add_columns(
	'language_code' => { data_type => 'text', is_nullable => 0 },
	      'unicode' => { data_type => 'text', is_nullable => 1 },
	      'english' => { data_type => 'text', is_nullable => 0 },
	    'direction' => { data_type => 'text', default_value => 'ltr', is_nullable => 0 },
	     'priority' => { data_type => 'integer', default_value => 999, is_nullable => 0 },
	         'beta' => { data_type => 'boolean', default_value => \'true', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('language_code');

__PACKAGE__->has_many('lexicon' => 'Quran::Schema::I18N::Lexicon',
	{ 'foreign.language_code' => 'self.language_code' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('resource' => 'Quran::Schema::Content::Resource',
	{ 'foreign.language_code' => 'self.language_code' },
	{ cascade_copy => 0, cascade_delete => 0 });

1;
