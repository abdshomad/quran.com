package Quran::Schema::View::AutoComplete::Tag;

use strict;
use warnings;

use base 'DBIx::Class::Core';

# Takes: member_id, surah_id, ayah_num, term

__PACKAGE__->table_class('DBIx::Class::ResultSource::View');
__PACKAGE__->table('view.autocomplete_tags');
__PACKAGE__->result_source_instance->is_virtual(1);
__PACKAGE__->result_source_instance->view_definition("SELECT array_agg(value) AS tags FROM (SELECT * FROM (SELECT DISTINCT st.value, params.term, (CASE WHEN qa.surah_id = params.surah_id AND at.member_id = params.member_id THEN true ELSE false END) AS surah_member, (CASE WHEN qa.surah_id = params.surah_id THEN true ELSE false END) AS surah, (CASE WHEN qa.surah_id = params.surah_id AND qa.ayah_num = params.ayah_num THEN true ELSE false END) AS ayah, (CASE WHEN at.member_id = params.member_id THEN true ELSE false END) AS member FROM collective.tag st, account.tag at, quran.ayah qa, (SELECT ?::integer AS member_id, ?::integer AS surah_id, ?::integer AS ayah_num, ?::text AS term) params WHERE st.tag_id = at.tag_id AND at.ayah_key = qa.ayah_key) sub WHERE value ~~* coalesce(term || '%') ORDER BY surah_member DESC, member DESC, ayah DESC, surah DESC, length(value) ASC, value ASC) sub");
__PACKAGE__->add_columns('tags' => { data_type => 'text[]' });

1;
