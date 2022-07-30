import * as React from "react";
import { Header, Breadcrumbs, Search, useNotionContext } from "react-notion-x";
import * as types from "notion-types";

import styles from "./styles.module.css";

// const ToggleThemeButton = () => {
// 	const [hasMounted, setHasMounted] = React.useState(false);
// 	const { isDarkMode, toggleDarkMode } = useDarkMode();

// 	React.useEffect(() => {
// 		setHasMounted(true);
// 	}, []);

// 	const onToggleTheme = React.useCallback(() => {
// 		toggleDarkMode();
// 	}, [toggleDarkMode]);

// 	return (
// 		<div
// 			className={cs("breadcrumb", "button", !hasMounted && styles.hidden)}
// 			onClick={onToggleTheme}
// 		>
// 			{hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
// 		</div>
// 	);
// };

export const NotionPageHeader: React.FC<{
	block: types.CollectionViewPageBlock | types.PageBlock;
}> = ({ block }) => {
	const { components, mapPageUrl } = useNotionContext();

	return (
		<div className="notion-header">
			<div className="notion-nav-header">
				<Breadcrumbs block={block} rootOnly={true} />

				<div className="notion-nav-header-rhs breadcrumbs">
					{/* <ToggleThemeButton /> */}

					<Search block={block} title={null} />
				</div>
			</div>
		</div>
	);
};
