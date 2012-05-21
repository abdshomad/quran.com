# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::Author;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.author');

__PACKAGE__->add_columns(
	'author_id', { data_type => 'integer', is_nullable => 0 },
	'name',      { data_type => 'text', is_nullable => 0  },
	'url',       { data_type => 'text[]', is_nullable => 1  },
);
__PACKAGE__->set_primary_key('author_id');

__PACKAGE__->has_many('resource' => 'Quran::Schema::Content::Resource',
	{ 'foreign.author_id' => 'self.author_id' });

1;
