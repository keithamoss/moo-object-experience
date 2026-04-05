import { Burger, Container, Divider, Drawer, Group, Image, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.svg';
import classes from './Header.module.css';

export default function Header() {
	const [opened, { toggle, close }] = useDisclosure(false);

	const items: React.ReactNode[] = [];

	return (
		<header className={classes.header}>
			<Container size="lg" className={classes.inner}>
				<Link to="/" aria-label="Museum Object Experience - Go to homepage" className={classes.brand}>
					<Group gap="xs" wrap="nowrap">
						<Image src={logoUrl} alt="" className={classes.logoImg} />
						<span>Museum Object Experience</span>
					</Group>
				</Link>

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
