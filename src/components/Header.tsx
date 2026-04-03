import { Burger, Container, Divider, Drawer, Group, ScrollArea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import classes from './Header.module.css';

export default function Header() {
	const [opened, { toggle, close }] = useDisclosure(false);

	const items: React.ReactNode[] = [];

	return (
		<header className={classes.header}>
			<Container size="lg" className={classes.inner}>
				<Text component={Link} to="/" aria-label="Museum Object Experience - Go to homepage" className={classes.brand}>
					Museum Object Experience
				</Text>

				<Group gap={5} visibleFrom="xs">
					{items}
				</Group>

				<Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" aria-label="Toggle navigation" />
			</Container>

			<Drawer
				opened={opened}
				onClose={close}
				size="100%"
				padding="md"
				title="Navigation"
				hiddenFrom="xs"
				zIndex={1000000}
			>
				<ScrollArea h="calc(100vh - 80px)" mx="-md">
					<Divider my="sm" />
					{items}
				</ScrollArea>
			</Drawer>
		</header>
	);
}
