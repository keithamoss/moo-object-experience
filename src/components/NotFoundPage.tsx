import { Button, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import notFoundImage from './NotFoundImage.svg';
import classes from './NotFoundPage.module.css';
import { PageMetadata } from './PageMetadata';

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<Container className={classes.root}>
			<PageMetadata title="Page Not Found | Westralian People's Museum" />
			<SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
				<Image src={notFoundImage} className={classes.mobileImage} alt="Page not found" />
				<div>
					<Title className={classes.title}>Something is not right...</Title>
					<Text c="dimmed" size="lg">
						The page you are trying to open does not exist. You may have mistyped the address, or the page has been
						moved to another URL.
					</Text>
					<Button variant="outline" size="md" mt="xl" className={classes.control} onClick={() => navigate('/')}>
						Get back to home page
					</Button>
				</div>
				<Image src={notFoundImage} className={classes.desktopImage} alt="Page not found" />
			</SimpleGrid>
		</Container>
	);
}
