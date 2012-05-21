# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::View::Search::Bookmarks;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table_class('DBIx::Class::ResultSource::View');
__PACKAGE__->table('view.search_bookmarks');
__PACKAGE__->result_source_instance->is_virtual(1);
__PACKAGE__->result_source_instance->view_definition('SELECT key FROM search_bookmarks(?, ?, ?) AS search(key text)');
__PACKAGE__->add_columns('key' => { data_type => 'text' });
__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah', { 'foreign.ayah_key' => 'self.key' });

1;
