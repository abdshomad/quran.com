package Quran::Controller::Main::Ajax;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

__PACKAGE__->config({
	json_options => {
		relaxed => 1,
		allow_nonref => 1
	}
});

sub base :Chained('/main/_ayahs') :PathPart('ajax') :CaptureArgs(0) {}
sub ajax :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub ajax_POST {
	my ($self, $c) = @_;
	my $stash = $c->stash;
	my $session = $c->session;
	my ($surah, $first, $last) = ($stash->{page}->{surah}, $stash->{page}->{first}, $stash->{page}->{last});
	my $params = $c->request->data;
	my $response = {};

	my $status_ok = sub {
		my $data = shift;
		my $response = {
			cached => $params->{cached},
			  data => $data
		};
		$session->{selected} = $params->{selected};
		$self->status_ok($c, entity => $response);
	};

	my $status_no_content = sub {
		$session->{selected} = $params->{selected};
		$self->status_no_content($c);
	};

	my $_selected = {
		    quran => $params->{selected}->{quran},
		resources => $params->{selected}->{resources}->{ $stash->{language}->{language_code} }
	};
	my $_cached = {
		    quran => $params->{cached}->{quran},
		resources => $params->{cached}->{resources}->{ $stash->{language}->{language_code} }
	};
	for my $resource_code (keys %{ $params->{selected}->{resources}->{ $stash->{language}->{language_code} }->{translation} }) {
		unless ($params->{cached}->{resources}->{ $stash->{language}->{language_code} }->{translation}->{ $resource_code }) {
			my $array = $c->content($surah, $first, $last)->translation({ $resource_code => 1 });
			$_ = $_->[0] for @{ $array };
			$params->{cached}->{resources}->{ $stash->{language}->{language_code} }->{translation}->{ $resource_code } = 1;
			$status_ok->($array) and return;
		}
	}

	unless ($params->{cached}->{resources}->{ $stash->{language}->{language_code} }->{transliteration} or not $params->{selected}->{resources}->{ $stash->{language}->{language_code} }->{transliteration}) {
		my $array = $c->content($surah, $first, $last)->transliteration(1);
		$_ = $_->[0] for @{ $array };
		$params->{cached}->{resources}->{ $stash->{language}->{language_code} }->{transliteration} = 1;
		$status_ok->($array) and return;
	}

	my ($type) = keys %{ $params->{selected}->{quran} };
	my $resource_code = $params->{selected}->{quran}->{ $type } if $type eq 'text';
	unless ($params->{cached}->{quran}->{ $type } and not $resource_code or $params->{cached}->{quran}->{ $type }->{ $resource_code }) {
		my $array = $c->content($surah, $first, $last)->quran({ $type => $params->{selected}->{quran}->{ $type } });
		if ($resource_code) {
			$params->{cached}->{quran}->{ $type }->{ $resource_code } = 1;
		}
		else {
			$params->{cached}->{quran}->{ $type } = 1;
		}
		$status_ok->($array) and return;
	}

	$status_no_content->() and return;
}
__PACKAGE__->meta->make_immutable;

1;
