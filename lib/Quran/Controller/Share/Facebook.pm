package Quran::Controller::Share::Facebook;
use Moose;
use namespace::autoclean;

BEGIN {
	#extends 'Catalyst::Controller::REST';
	extends 'Quran::Controller::Share';
	   with 'Quran::System::Share';
}

# without access token
# https://www.facebook.com/dialog/feed?app_id=155032717920714&redirect_uri=http%3A%2F%2Fquran.com%2Fme%2Fshare%2Fauth%2Ffacebook%2Freturn&link=http://quran.com/2/255&picture=http://corpus.quran.com/images/quran2.jpeg&name=custom&caption=caption&description=custom&display=popup
# with access token
# https://www.facebook.com/dialog/feed?app_id=155032717920714&redirect_uri=http%3A%2F%2Fquran.com%2Fme%2Fshare%2Fauth%2Ffacebook%2Freturn&link=http://quran.com/2/255&picture=http://corpus.quran.com/images/quran2.jpeg&name=custom&caption=caption&description=custom&display=iframe&access_token=AAACNAF4UicoBANOWBvniU63ZCowCdnC4p1nzBZA42MZBKd1pxUSKJtO5JNtOpSlT0pMr3BNCGvAZB3mIBnUasOAZB2KAWJS55QrJpLVYKcgZDZD
sub comment {
	my ($self, $c, $account, $params) = @_;
	my ($result);

	$result = $self->api->request(
		account => $account,
		method => 'POST',
		resource => 'me/feed',
		params => {
			message => $self->_comment_foo($c, $params),
			link => $self->_comment_link($c, $params),
			picture => $self->_comment_link_picture($c, $params),
			name => $self->_comment_link_title($c, $params),
			caption => $self->_comment_link_caption($c, $params),
			description => $self->_comment_link_description($c, $params)
		}
	);

	return $result;
}

sub base :Chained('/share/base') :PathPart('facebook') :CaptureArgs(0) {}

sub callback :Chained('base') :PathPart('callback') :Args(0) :ActionClass('REST') {}

sub callback_GET {
	my ($self, $c) = (shift, shift);
	my ($params) = ($c->request->params);

	my $challenge = $params->{'hub.challenge'};

	$c->response->code(200);
	$c->response->body( $challenge );
}

sub callback_POST {
	my ($self, $c) = (shift, shift);
	my ($request) = ($c->request);
	my ($body, $params) = ($c->request->body, $c->request->data);

	my $ref = ref $body;
	my $content;

	if ($ref eq 'File::Temp') {
		my $file = $body->filename;
		my $handle;
		open $handle, "<$file";
		while (<$handle>) { $content .= $_ }
		close $handle;
	}
	else {
		$content = $body;
	}

	use Digest::SHA qw/hmac_sha1_hex/;

	my $secret = $self->auth->secret;
	my $validate = $request->header('X-Hub-Signature');
	my $integrity = 'sha1='. hmac_sha1_hex($content, $secret);

	if ($validate eq $integrity) {
		# do stuff
	}

	$c->log->debug("ref $ref");
	$c->log->debug("content $content");
	$c->log->debug("secret $secret");
	$c->log->debug("validate $validate");
	$c->log->debug("integrity $integrity");

	$self->status_ok($c, entity => { msg => 'thx' });
}

# subscribe e.g.
# curl -F 'object=permissions' -F 'fields=publish_stream' -F 'callback_url=http://pre-alpha.quran.com/share/facebook/callback' -F 'verify_token=foo' 'https://graph.facebook.com/155032717920714/subscriptions?access_token=155032717920714|IScy7g4StX09KMLpW_Uxg6koIfE'
# https://graph.facebook.com/1925544/permissions?access_token=AAACNAF4UicoBAEtOMiIadjm8f1qtIj3COx6Mfs2s9BnLYoZB5VQRXeD737yezca7sm8hTzPd20VBDRa050KYUk8xOD9Fz2KeQ4YMjBQZDZD

__PACKAGE__->meta->make_immutable;

1;
