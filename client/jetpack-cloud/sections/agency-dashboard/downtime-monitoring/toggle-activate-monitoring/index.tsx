import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useState, useRef } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Tooltip from 'calypso/components/tooltip';
import { useSelector } from 'calypso/state';
import { getSiteMonitorStatuses } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { useJetpackAgencyDashboardRecordTrackEvent, useToggleActivateMonitor } from '../../hooks';
import NotificationSettings from '../notification-settings';
import UpgradePopover from '../upgrade-popover';
import type { AllowedStatusTypes, MonitorSettings, Site } from '../../sites-overview/types';

import './style.scss';

interface Props {
	site: Site;
	status: AllowedStatusTypes | string;
	settings: MonitorSettings | undefined;
	tooltip: ReactNode;
	tooltipId: string;
	siteError: boolean;
	isLargeScreen?: boolean;
}

export default function ToggleActivateMonitoring( {
	site,
	status,
	settings,
	tooltip,
	tooltipId,
	siteError,
	isLargeScreen,
}: Props ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );
	const statuses = useSelector( getSiteMonitorStatuses );
	const [ showNotificationSettings, setShowNotificationSettings ] = useState< boolean >( false );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const isPaidTierEnabled = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	// TODO: Need to figure out if current site has no existing paid version of downtime monitoring.
	const shouldDisplayUpgradePopover = status === 'success' && isPaidTierEnabled;

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	function handleToggleActivateMonitoring( checked: boolean ) {
		recordEvent( checked ? 'enable_monitor_click' : 'disable_monitor_click' );
		toggleActivateMonitor( checked );
	}

	function handleToggleNotificationSettings() {
		if ( ! showNotificationSettings ) {
			recordEvent( 'notification_settings_open' );
		}
		setShowNotificationSettings( ( isOpen ) => ! isOpen );
	}

	const statusContentRef = useRef< HTMLSpanElement | null >( null );

	const isChecked = status !== 'disabled';
	const isLoading = statuses?.[ site.blog_id ] === 'loading';

	const currentSettings = () => {
		const minutes = settings?.monitor_deferment_time;
		if ( ! minutes ) {
			return null;
		}
		// Convert minutes to moment duration to show "hr" if monitor_deferment_time is greater than 60
		const duration = moment.duration( minutes, 'minutes' );
		const hours = Math.floor( duration.asHours() );
		const currentDurationText = hours
			? // Adding the plural form since some languages might need different forms for the abbreviation.
			  translate( '%(hours)dhr', '%(hours)dhr', {
					count: hours,
					args: {
						hours,
					},
					comment: '%(hours) is the no of hours, e.g. "1hr"',
			  } )
			: translate( '%(minutes)dm', '%(minutes)dm', {
					count: minutes,
					args: {
						minutes,
					},
					comment: '%(minutes) is the no of minutes, e.g. "5m"',
			  } );

		const currentSchedule = hours
			? translate( '%(hours)d hour', '%(hours)d hours', {
					count: hours,
					args: {
						hours,
					},
					comment: '%(hours) is the no of hours, e.g. "1 hour"',
			  } )
			: translate( '%(minutes)d minute', '%(minutes)d minutes', {
					count: minutes,
					args: {
						minutes,
					},
					comment: '%(minutes) is the no of minutes, e.g. "5 minutes"',
			  } );
		return (
			<div className="toggle-activate-monitoring__duration">
				<Button
					borderless
					compact
					onClick={ handleToggleNotificationSettings }
					disabled={ isLoading }
					aria-label={
						translate(
							'The current notification schedule is set to %(currentSchedule)s. Click here to update the settings',
							{
								args: { currentSchedule },
								comment:
									'%(currentSchedule) is the current notification duration set, e.g. "1 hour" or "5 minutes"',
							}
						) as string
					}
				>
					<img src={ clockIcon } alt={ translate( 'Current Schedule' ) } />
					<span>{ currentDurationText }</span>
				</Button>
			</div>
		);
	};

	const toggleContent = (
		<ToggleControl
			onChange={ handleToggleActivateMonitoring }
			checked={ isChecked }
			disabled={ isLoading || siteError }
			label={ isChecked && currentSettings() }
		/>
	);

	if ( siteError ) {
		return (
			<span className="toggle-activate-monitoring__toggle-button sites-overview__disabled">
				{ toggleContent }
			</span>
		);
	}

	const upgradePopoverOrTooltip = shouldDisplayUpgradePopover ? (
		<UpgradePopover
			context={ statusContentRef.current }
			isVisible={ showTooltip }
			position="bottom left"
			onClose={ handleHideTooltip }
		/>
	) : (
		tooltip && (
			<Tooltip
				id={ tooltipId }
				context={ statusContentRef.current }
				isVisible={ showTooltip }
				position="bottom"
				className="sites-overview__tooltip"
			>
				{ tooltip }
			</Tooltip>
		)
	);

	return (
		<>
			<span
				className="toggle-activate-monitoring__toggle-button"
				// We don't want to hide the tooltip when the user clicks on the
				// upgrade popover since it has buttons that user can interact with.
				onMouseDown={ shouldDisplayUpgradePopover ? undefined : handleHideTooltip }
				onMouseEnter={ handleShowTooltip }
				onMouseLeave={ handleHideTooltip }
				ref={ statusContentRef }
				role="button"
				tabIndex={ 0 }
			>
				{ toggleContent }

				{ upgradePopoverOrTooltip }
			</span>

			{ showNotificationSettings && (
				<NotificationSettings
					onClose={ handleToggleNotificationSettings }
					sites={ [ site ] }
					settings={ settings }
					isLargeScreen={ isLargeScreen }
				/>
			) }
		</>
	);
}
