import { Anchor, Container, Group, Text } from '@mantine/core';
import classes from './Footer.module.css';

const links = [{ link: 'mailto:contact@example.com', label: 'Contact' }];

export default function Footer() {
	const currentYear = new Date().getFullYear();

	const items = links.map((link) => (
		<Anchor c="dimmed" key={link.label} href={link.link} size="sm">
			{link.label}
		</Anchor>
	));

	return (
		<footer className={classes.footer}>
			<Container size="lg" className={classes.inner}>
				<Text size="sm" c="dimmed">
					© {currentYear} Westralian People's Museum of Objects of Interest and Reference Library
				</Text>
				<Group className={classes.links}>{items}</Group>
			</Container>
		</footer>
	);
}
