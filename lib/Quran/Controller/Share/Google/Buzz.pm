package Quran::Controller::Share::Google::Buzz;
use Moose;
use namespace::autoclean;

BEGIN {
	extends 'Catalyst::Controller::REST';
	   with 'Quran::System::Share';
}

sub comment {
	my ($self, $c, $account) = @_;
	my ($result);

	$result = $self->api->request(
		account => $account,
		method => 'POST',
		resource => 'activities/@me/@self',
		params => {
			data => {
				object => {
					type => 'note',
					content => 'this is the content',
					attachments => [{
						type => 'photo',
						content => 'buzz_twitter_traffic.jpg',
						links => {
							enclosure => [{
								href => 'http://lh4.ggpht.com/_f0qVMWvWkZQ/S-mPy_d_wzI/AAAAAAAAACE/tRh1_oH8W04/buzz_twitter_traffic.jpg'
							}],
							alternate => [{
								href => 'http://picasaweb.google.com/111062888259659218284/20100323?authkey=Gv1sRgCI73sZyWvIyRJw#5451873675887972898'
							}],
							preview => [{
								href => 'http://lh4.ggpht.com/_f0qVMWvWkZQ/S-mPy_d_wzI/AAAAAAAAACE/tRh1_oH8W04/s288/buzz_twitter_traffic.jpg',
								height => 120,
								width => 194
							}]
						}
					}]
				}
			}
		}
	);

	return $result;
}

__PACKAGE__->meta->make_immutable;

1;
