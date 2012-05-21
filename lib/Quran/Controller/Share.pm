package Quran::Controller::Share;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/base') :PathPart('share') :CaptureArgs(0) {}

sub _comment {}
sub _comment_foo {
	my ($self, $c, $params) = @_;

	return $params->{comment};
}
sub _comment_link {
	my ($self, $c, $params) = @_;
	my ($surah, $ayah) = split /:/, $params->{ayah}, 2;

	my $link = "quran.com/$surah/$ayah";

	$link = $params->{language} .".$link"
		unless $params->{language} eq 'en';

	return "http://$link";
}
sub _comment_link_title {
	my ($self, $c, $params) = @_;
	my ($surah, $ayah) = split /:/, $params->{ayah}, 2;

	return "The Noble Quran - Surah $surah, Ayah $ayah - give me a proper title with full l10n";
}
sub _comment_link_caption {
	my ($self, $c, $params) = @_;

	(my $caption = $self->_comment_link($c, $params)) =~ s/http:\/\///;

	return $caption;
}
sub _comment_link_picture {
	my ($self, $c, $params) = @_;

	return 'http://corpus.quran.com/images/quran2.jpeg';
}
sub _comment_link_description {
	my ($self, $c, $params) = @_;
	my ($surah, $ayah) = split /:/, $params->{ayah}, 2;
	my ($type, $code) = split /:/, $params->{resource}, 2;
	my $language = $params->{language};

	return "look me up $language:$type:$code";
}

__PACKAGE__->meta->make_immutable;

1;
