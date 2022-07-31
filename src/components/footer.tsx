const Footer = () => {
	return (
		<footer className="h-10 w-screen flex justify-center text-xs text-neutral-500">
			<div className="my-auto px-3 text-center">
				Made with and inspired by{" "}
				<a className="hover:underline font-semibold" href="https://notion.so">
					notion
				</a>
				. Built and designed with ❤️ by{" "}
				<a
					className="hover:underline font-semibold "
					href="https://dylanbrown.space"
				>
					Dylan Brown
				</a>
			</div>
		</footer>
	);
};

export default Footer;
