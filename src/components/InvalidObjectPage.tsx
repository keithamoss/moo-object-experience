import { Button, Container, Group, Image, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import invalidObjectImage from './InvalidObjectImage.svg';
import classes from './InvalidObjectPage.module.css';

interface InvalidObjectPageProps {
	readonly reason: 'missing-identifier' | 'invalid-data';
	readonly objectId?: string;
}

/**
 * Error page shown when an object has invalid or missing required data
 * More informative than a generic 404
 */
export default function InvalidObjectPage({ reason, objectId }: InvalidObjectPageProps) {
	const navigate = useNavigate();

	const messages = {
		'missing-identifier': {
			title: 'Invalid Object',
			description:
				'This object is missing a required identifier field and cannot be displayed. This may indicate a data quality issue.',
		},
		'invalid-data': {
			title: 'Invalid Object Data',
			description: 'This object has incomplete or invalid data structure and cannot be displayed properly.',
		},
	};

	const { title, description } = messages[reason];

	return (
		<Container size="md" className={classes.root}>
			<Image src={invalidObjectImage} className={classes.image} />
			<Title className={classes.title}>{title}</Title>
			<Text c="dimmed" size="lg" ta="center" className={classes.description}>
				{description}
			</Text>
			{objectId && (
				<Text size="sm" c="dimmed" ff="monospace" ta="center" className={classes.objectId}>
					Object ID: {objectId}
				</Text>
			)}
			<Group justify="center">
				<Button size="md" onClick={() => navigate('/')}>
					Return to Home
				</Button>
				<Button size="md" variant="subtle" onClick={() => navigate(-1)}>
					Go Back
				</Button>
			</Group>
		</Container>
	);
}
