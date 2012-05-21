package Quran::Controller::Tafsir;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

# TODO: tafsir view implemented through chained controller
# e.g. /ar/tafsir/al_qurtubi/80/27

sub base :Chained('/') :PathPart('tafsir') :CaptureArgs(3) {
	my ($self, $c, $resource_code, $surah_id, $ayah_num) = @_;
	#$c->log->debug(__PACKAGE__ .' : base');

	my $language_code = $c->stash->{language}->{language_code};

	$c->stash->{content} = $c->memcache->search("tafsir:$language_code:$resource_code:$surah_id:$ayah_num", {
		model => 'DB::Content::Resource',
		where => {
			'me.type'          => 'tafsir',
			'me.language_code' => $language_code,
			'me.resource_code' => $resource_code,
			'ayah.surah_id'    => $surah_id,
			'ayah.ayah_num'    => $ayah_num
		},
		attrs => {
			join     => { tafsir => { tafsir_ayah => 'ayah' } },
			columns  => [{ name => 'me.name' }, { text => 'tafsir.text' }, { ayah_key => 'ayah.ayah_key' }],
		}
	})->[0];

	$c->stash(
		name => $resource_code, surah_id => $surah_id, ayah_num => $ayah_num,
		template => 'screen/tafsir/view.mhtml',
		static => { css => ['screen/tafsir/view.css'] },
		include => { head => 0, body => 0, foot => 0 }
	);
}

sub view :Chained('base') :PathPart('') :Args(0) {
	my ($self, $c) = @_;
	#$c->log->debug(__PACKAGE__ .' : view');
}

__PACKAGE__->meta->make_immutable;

1;
