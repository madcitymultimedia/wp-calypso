type Props = {
	className?: string;
	size?: number;
};

const SenseiLogo: React.FunctionComponent< Props > = ( {
	className = 'sensei-logo',
	size = 18,
} ) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
			width={ size }
			height={ size }
			fill="none"
			viewBox="0 0 18 18"
		>
			<circle cx="9" cy="9" r="9" fill="#101517"></circle>
			<path
				fill="#fff"
				fillRule="evenodd"
				d="M7.427 11.513c.211-.175.126-.36.422-.427-.013.147.103.296.178.427-.077-.279-.002-.407.055-.546.245-.596-.466-.981-.95-1.076.165-.125.28-.248.489-.27a1.574 1.574 0 00-.746.175c-.783.403-1.403-.397-.993-1.122.219-.388.468-.394.692-.657a.85.85 0 01.053.428.747.747 0 00.034-.504c-.073-.255-.282-.256-.32-.623-.009-.076-.075.043-.186-.058-.027-.024-.08-.068-.115-.048-.06.033-.127.006-.163.025-.06.032-.077-.034-.141.012-.114.082-.126-.01-.234.005-.136.017-.226.198-.303.108-.071-.081-.145.058-.197.058-.036 0-.22.24-.3.02-.061-.163-.197.157-.27.048-.023-.034-.086.082-.126-.033-.01-.026 0-.06-.076-.02-.151.075-.098-.046-.146-.11-.059-.078-.08-.078-.048-.204.025-.1-.013-.25.14-.276.04-.007.076-.004.13-.113.068-.136.163-.07.146-.132-.025-.09.101-.213.16-.27.077-.078.179-.19.215-.3a.48.48 0 01.072-.107c.057-.064.074-.002.16-.034.062-.023.014.04.075-.053.02-.03.073-.002.133-.03.182-.085.2-.084.245-.282.008-.037.017-.066.056-.062.077.007.094-.04.142-.039.042.002.057-.022.08-.05.126-.165.195-.042.251-.055.043-.01.016-.108.13-.078.163.044.11-.039.214-.012.122.032.13.144.215.171.101.032.149.15.216.15.238-.005.166.173.316.244-.113-.122.008-.32-.248-.345-.057-.005-.077-.096-.162-.139-.103-.05-.092-.16-.277-.204.047-.032.062.003.09-.056.042-.084.065-.035.08-.086.015-.048.005-.075.117-.118.116-.044.228-.148.332-.142.092.005.13-.06.125-.143-.006-.086-.023-.204.156-.167.108.02.106.001.106-.077-.001-.078.028-.125.122-.122.07.003.137-.001.163-.088.02-.07.146-.087.213-.113.223-.086.254.038.315-.071.05-.09.138-.241.237-.133.02.022.038.038.105-.043.057-.067.19-.151.238-.036.02.046.061.092.097.033a.057.057 0 01.038-.03c.036-.007.055-.017.073-.026.154-.077.22-.072.15.095-.1.24.558-.146.375.114-.067.095.379.15.444.193.035.024.034.044.101.058.191.037.188.02.2.184.005.074.076.033.076.128 0 .405.332.201.386.302.009.017.023.032.056.032.104 0 .11-.022.158.068.02.036.035.054.09.072.083.029.078.039.047.105-.038.079.021.078.098.085.07.007.103.048.151.105.079.092.2.119.303.172.06.03.001.106.1.185.074.058.111.05.013.125-.417.317.154.23.314.526.035.066.083.148.151.224.16.174.07.223.156.331.05.063.011.048.092.104.191.133-.074.222-.224.161-.07-.027-.117-.064-.104-.02.01.038-.008.064-.037.092-.088.085.086.052.128.046.127-.02.467-.058.465.07-.004.167.095.205.176.216.13.018.167.043.239.17.064.116.102.054.203.157.068.07.153.195.014.214-.033.004-.07 0-.085.012a.28.28 0 01-.098.05c-.208.069.098.104.173.086.066-.015.147-.037.21-.02.041.011.045.06.173.081.043.007.025.075.004.122-.073.162.135.076.114.199-.013.07.076.185-.048.188-.04 0-.082-.011-.08.025.002.08-.117-.022-.224.088-.04.041-.134.07-.192-.007-.022-.029-.05-.052-.153-.017-.102.035-.171.154-.216-.03-.012-.05-.035-.05-.1-.074-.088-.033-.08-.196-.21-.09a.16.16 0 01-.15.028c-.101-.027-.214.01-.223-.072a.255.255 0 00-.266-.225c-.104.006-.195.025-.25-.104.04.148.146.158.269.158.102 0 .162.057.18.17.031.201.144.075.286.17.07.046.12.12.148.207.03.09.261-.018.199.196-.027.092-.076.127-.171.201-.282.223-.352.003-.436.181-.043.093-.044.024-.138.07-.155.073-.254-.098-.367-.035-.128.071-.118-.061-.248.028-.107.073-.217-.056-.268.145-.044.172-.227.176-.31.084-.133-.147-.093.173-.255.041-.086-.07-.15.032-.276.034-.233.004-.344-.214-.458-.081-.135.156-.233-.024-.235-.184-.002-.163-.548-.109-.834-.194-.16-.047-.658.01-.495-.265-.262.296.321.277.48.345.096.04.173.072.266.086.091.225.15.468.16.764.03-.162.037-.329.02-.492-.03-.29.17.144.194.207.13.341-.016.968-.344 1.157a2.293 2.293 0 00-.396-.751c.18.297.434.904.23 1.251a.74.74 0 01-.386-.366c.053.253.29.533.575.44.498-.161.496.177 1.156.233.48.084 1.165 0 1.492.028.179.015.93.15.926.352-.013.84-.308.883-1.084.963-.45.046-.799.064-1.284.084a44.096 44.096 0 01-3.429-.002c-.51-.022-.755-.026-1.297-.103-.541-.076-.838-.275-.83-.9.004-.231.638-.451.845-.476.245-.03.636.003.99-.089.372-.096.527-.16.8-.385zm3.766-4.59c-.117-.033-.035-.106-.238-.012-.12.056-.137-.098-.258-.07-.12.027-.17-.096-.35-.127-.225-.039-.063-.1-.418-.024-.068.014-.126-.069-.339-.04-.25.035-.162.064-.313-.087-.192-.19-.344-.062-.54-.14.151.127.259.015.438.168-.17.105-.369.609-.678.64.337.082.5.269.808.314.356.051.622.089.812.402.212.352.31.15.615.128.194-.013.199-.14.23-.275.045-.186.09-.194.22-.219.15-.028.114-.07.075-.118-.106-.13.013-.157.103-.185.156-.049.03-.057.03-.127-.196-.067-.045-.164.064-.206.119.079.17.066.223.055.077-.016.128.023.193-.022-.096.012-.115-.027-.196-.015-.036.006-.08.008-.154-.04-.127-.082-.19.036-.327 0zM9.588 8.165l-.769-.414c-.926-.498-1.348.238-1.646 1.044l-.54.554c.387-.256.703-.541 1.11-.539.064 0 1.067.368.906-.07-.03-.078.063-.04.088-.152.028-.129.038-.107.137-.025.062.052.149.086.122-.036-.011-.055-.027-.104.197-.003.107.047.067-.049.214-.068.204-.026.16-.236.257-.265.053-.017.107.043.207-.058.035-.036.077-.068.164-.044-.1-.055-.155-.01-.206.023-.103.067-.143-.028-.241.053zM8.017 6.707c.112-.015.225-.027.34-.035a.09.09 0 00.057-.113.204.204 0 01.103-.157L8.516 6.4c-.182 0-.329.075-.515.16-.037.017-.017.084-.083.161a.194.194 0 01-.142.179.094.094 0 00-.063.034.09.09 0 00-.018.07.169.169 0 01-.195.047c-.141-.059-.246-.05-.316.027a.258.258 0 01.28.011c.095.05.212.023.275-.062a.095.095 0 01.089-.075c.1-.04.162-.122.189-.245z"
				clipRule="evenodd"
			></path>
		</svg>
	);
};

export default SenseiLogo;