/* eslint-disable */
import {mxConstants, mxResources, mxUtils} from "../../core/mxgraph";
import {Sidebar} from "../Sidebar";

(function () {

    Sidebar.prototype.addClipartComputerPalette = function (expand) {
        this.addImagePalette('computer', '剪贴画/计算机', mxUtils.staticImg('/rcscada/img/clip_art/computers/'), '_128x128.png', ['Antivirus',
            'Data_Filtering', 'Database', 'Database_Add', 'Database_Minus',
            'Database_Move_Stack', 'Database_Remove', 'Fujitsu_Tablet',
            'Harddrive', 'IBM_Tablet', 'iMac', 'iPad', 'Laptop', 'MacBook',
            'Mainframe', 'Monitor', 'Monitor_Tower',
            'Monitor_Tower_Behind', 'Netbook', 'Network', 'Network_2',
            'Printer', 'Printer_Commercial', 'Secure_System', 'Server',
            'Server_Rack', 'Server_Rack_Empty', 'Server_Rack_Partial',
            'Server_Tower', 'Software', 'Stylus', 'Touch', 'USB_Hub',
            'Virtual_Application', 'Virtual_Machine', 'Virus',
            'Workstation'], ['Antivirus', 'Data Filtering', 'Database',
            'Database Add', 'Database Minus', 'Database Move Stack',
            'Database Remove', 'Fujitsu Tablet', 'Harddrive', 'IBMTablet',
            'iMac', 'iPad', 'Laptop', 'MacBook', 'Mainframe', 'Monitor',
            'Monitor Tower', 'Monitor Tower Behind', 'Netbook', 'Network',
            'Network 2', 'Printer', 'Printer Commercial', 'Secure System',
            'Server', 'Server Rack', 'Server Rack Empty', 'Server Rack Partial',
            'Server Tower', 'Software', 'Stylus', 'Touch', 'USB Hub',
            'Virtual Application', 'Virtual Machine', 'Virus', 'Workstation']);
    };

    Sidebar.prototype.addClipartFinancePalette = function (expand) {
        this.addImagePalette('finance', '剪贴画 / 金融', mxUtils.staticImg('/rcscada/img/clip_art/finance/'), '_128x128.png', ['Arrow_Down',
			'Arrow_Up', 'Coins', 'Credit_Card', 'Dollar', 'Graph',
			'Pie_Chart', 'Piggy_Bank', 'Safe', 'Shopping_Cart',
			'Stock_Down', 'Stock_Up'], ['Arrow_Down', 'Arrow Up',
			'Coins', 'Credit Card', 'Dollar', 'Graph', 'Pie Chart',
			'Piggy Bank', 'Safe', 'Shopping Basket', 'Stock Down', 'Stock Up']);
    };


    Sidebar.prototype.addClipartVariousPalette = function (expand) {
        this.addImagePalette('clipart', '剪贴画 / 各种各样的',
        mxUtils.staticImg('/rcscada/img/clip_art/general/'), '_128x128.png', ['Battery_0',
			'Battery_100', 'Battery_50', 'Battery_75', 'Battery_allstates',
			'Bluetooth', 'Earth_globe', 'Empty_Folder', 'Full_Folder',
			'Gear', 'Keys', 'Lock', 'Mouse_Pointer', 'Plug', 'Ships_Wheel',
			'Star', 'Tire'], ['Battery 0%', 'Battery 100%', 'Battery 50%',
			'Battery 75%', 'Battery', 'Bluetooth', 'Globe',
			'Empty Folder', 'Full Folder', 'Gear', 'Keys', 'Lock', 'Mousepointer',
			'Plug', 'Ships Wheel', 'Star', 'Tire']);
    };

    Sidebar.prototype.addClipartVariousPalette = function (expand) {
        this.addImagePalette('networking', '剪贴画 / 网络', mxUtils.staticImg('/rcscada/img/clip_art/networking/'), '_128x128.png', ['Bridge',
			'Certificate', 'Certificate_Off', 'Cloud', 'Cloud_Computer',
			'Cloud_Computer_Private', 'Cloud_Rack', 'Cloud_Rack_Private',
			'Cloud_Server', 'Cloud_Server_Private', 'Cloud_Storage',
			'Concentrator', 'Email', 'Firewall_02', 'Firewall',
			'Firewall-page1', 'Ip_Camera', 'Modem',
			'power_distribution_unit', 'Print_Server',
			'Print_Server_Wireless', 'Repeater', 'Router', 'Router_Icon',
			'Switch', 'UPS', 'Wireless_Router', 'Wireless_Router_N']);
    };

    Sidebar.prototype.addClipartPeoplePalette = function (expand) {
        this.addImagePalette('people', '剪贴画 / 头像', mxUtils.staticImg('/rcscada/img/clip_art/people/'), '_128x128.png', ['Suit_Man',
			'Suit_Man_Black', 'Suit_Man_Blue', 'Suit_Man_Green',
			'Suit_Man_Green_Black', 'Suit_Woman', 'Suit_Woman_Black',
			'Suit_Woman_Blue', 'Suit_Woman_Green',
			'Suit_Woman_Green_Black', 'Construction_Worker_Man',
			'Construction_Worker_Man_Black', 'Construction_Worker_Woman',
			'Construction_Worker_Woman_Black', 'Doctor_Man',
			'Doctor_Man_Black', 'Doctor_Woman', 'Doctor_Woman_Black',
			'Farmer_Man', 'Farmer_Man_Black', 'Farmer_Woman',
			'Farmer_Woman_Black', 'Nurse_Man', 'Nurse_Man_Black',
			'Nurse_Woman',
			'Nurse_Woman_Black',
			'Military_Officer', 'Military_Officer_Black',
			'Military_Officer_Woman', 'Military_Officer_Woman_Black',
			'Pilot_Man', 'Pilot_Man_Black', 'Pilot_Woman',
			'Pilot_Woman_Black', 'Scientist_Man', 'Scientist_Man_Black',
			'Scientist_Woman', 'Scientist_Woman_Black', 'Security_Man',
			'Security_Man_Black', 'Security_Woman', 'Security_Woman_Black',
			'Tech_Man', 'Tech_Man_Black',
			'Telesales_Man', 'Telesales_Man_Black', 'Telesales_Woman',
			'Telesales_Woman_Black', 'Waiter', 'Waiter_Black',
			'Waiter_Woman', 'Waiter_Woman_Black', 'Worker_Black',
			'Worker_Man', 'Worker_Woman', 'Worker_Woman_Black']);
    };

    Sidebar.prototype.addClipartTelecommunicationPalette = function (expand) {
        this.addImagePalette('telco', '剪贴画 / 电信', mxUtils.staticImg('/rcscada/img/clip_art/telecommunication/'), '_128x128.png', [
			'BlackBerry', 'Cellphone', 'HTC_smartphone', 'iPhone',
			'Palm_Treo', 'Signal_tower_off', 'Signal_tower_on']);
    };

    Sidebar.prototype.addActiveDirectoryPalette = function(expand){
		var d = 50;
		var dt = 'ibm';
		var s = 'image;aspect=fixed;perimeter=ellipsePerimeter;html=1;align=center;shadow=0;dashed=0;spacingTop=3;image=' + mxUtils.staticImg('/rcscada/img/active_directory/');
		var gn = 'ms active directory ';
		var fns = [
			 this.createVertexTemplateEntry(s + 'active_directory.svg;',
					 d, d * 0.85, '', 'Active Directory', false, null, this.getTagsForStencil(gn, 'active directory', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'cd_dvd.svg;',
					 d, d, '', 'CD / DVD', false, null, this.getTagsForStencil(gn, 'cd dvd compact digital video disc', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'cell_phone.svg;',
					 d * 0.42, d, '', 'Cell Phone', false, null, this.getTagsForStencil(gn, 'cell phone', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'cluster_server.svg;',
					 d, d, '', 'Cluster Server', false, null, this.getTagsForStencil(gn, 'active', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'community_discussion.svg;',
					 d, d * 0.9, '', 'Community Discussion', false, null, this.getTagsForStencil(gn, 'community discussion', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'data_jack.svg;',
					 d * 0.55, d, '', 'Data Jack', false, null, this.getTagsForStencil(gn, 'data jack', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database.svg;',
					 d, d * 0.74, '', 'Database', false, null, this.getTagsForStencil(gn, 'database', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_cube.svg;',
					 d * 0.9, d, '', 'Database Cube', false, null, this.getTagsForStencil(gn, 'database cube', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_partition_2.svg;',
					 d, d * 0.74, '', 'Database Partition 2', false, null, this.getTagsForStencil(gn, 'database partition two', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_partition_3.svg;',
					 d, d * 0.74, '', 'Database Partition 3', false, null, this.getTagsForStencil(gn, 'database partition three', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_partition_4.svg;',
					 d, d * 0.74, '', 'Database Partition 4', false, null, this.getTagsForStencil(gn, 'database partition four', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_partition_5.svg;',
					 d, d * 0.74, '', 'Database Partition 5', false, null, this.getTagsForStencil(gn, 'database partition five', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'database_server.svg;',
					 d * 0.82, d, '', 'Database Server', false, null, this.getTagsForStencil(gn, 'database server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'databases.svg;',
					 d, d * 0.98, '', 'Databases', false, null, this.getTagsForStencil(gn, 'databases', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'documents.svg;',
					 d * 0.66, d, '', 'Documents', false, null, this.getTagsForStencil(gn, 'documents', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'domain_controller.svg;',
					 d * 0.7, d, '', 'Domain Controller', false, null, this.getTagsForStencil(gn, 'domain controller', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'fax.svg;',
					 d, d * 0.75, '', 'Fax', false, null, this.getTagsForStencil(gn, 'fax', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'firewall.svg;',
					 d * 0.61, d, '', 'Firewall', false, null, this.getTagsForStencil(gn, 'firewall', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'folder.svg;',
					 d * 0.73, d, '', 'Folder', false, null, this.getTagsForStencil(gn, 'folder', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'folder_open.svg;',
					 d * 0.92, d, '', 'Folder Open', false, null, this.getTagsForStencil(gn, 'folder open', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'generic_node.svg;',
					 d, d * 0.98, '', 'Generic Node', false, null, this.getTagsForStencil(gn, 'generic node', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'generic_server.svg;',
					 d * 0.56, d, '', 'Generic Server', false, null, this.getTagsForStencil(gn, 'generic server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'hard_disk.svg;',
					 d, d * 0.54, '', 'Hard Disk', false, null, this.getTagsForStencil(gn, 'hard disk', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'home.svg;',
					 d, d * 0.97, '', 'Home', false, null, this.getTagsForStencil(gn, 'home', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'home_page.svg;',
					 d, d * 0.9, '', 'Home Page', false, null, this.getTagsForStencil(gn, 'home page', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'input_output_filter.svg;',
					 d * 0.67, d, '', 'Input/Output Filter', false, null, this.getTagsForStencil(gn, 'input output filter io', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'interface.svg;',
					 d, d * 0.47, '', 'Interface', false, null, this.getTagsForStencil(gn, 'active', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'internet_cloud.svg;',
					 d, d * 0.63, '', 'Internet Cloud', false, null, this.getTagsForStencil(gn, 'internet cloud', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'internet_globe.svg;',
					 d, d, '', 'Internet Globe', false, null, this.getTagsForStencil(gn, 'internet globe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'key.svg;',
					 d, d * 0.74, '', 'Key', false, null, this.getTagsForStencil(gn, 'key', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'laptop_client.svg;',
					 d * 0.9, d, '', 'Laptop Client', false, null, this.getTagsForStencil(gn, 'laptop client', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'list.svg;',
					 d * 0.7, d, '', 'List', false, null, this.getTagsForStencil(gn, 'list', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'mac_client.svg;',
					 d * 0.94, d, '', 'Mac Client', false, null, this.getTagsForStencil(gn, 'mac macintosh client', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'mainframe.svg;',
					 d, d * 0.95, '', 'Mainframe', false, null, this.getTagsForStencil(gn, 'mainframe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'mainframe_host.svg;',
					 d * 0.72, d, '', 'Mainframe Host', false, null, this.getTagsForStencil(gn, 'mainframe host', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'meeting.svg;',
					 d, d * 0.91, '', 'Meeting', false, null, this.getTagsForStencil(gn, 'meeting', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'modem.svg;',
					 d, d * 0.83, '', 'Modem', false, null, this.getTagsForStencil(gn, 'modem', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'my_sites.svg;',
					 d, d * 0.9, '', 'My Sites', false, null, this.getTagsForStencil(gn, 'my sites', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'not_secure.svg;',
					 d * 0.88, d, '', 'Not Secure', false, null, this.getTagsForStencil(gn, 'not secure', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'pda.svg;',
					 d * 0.54, d, '', 'PDA', false, null, this.getTagsForStencil(gn, 'pda personal digital assistant', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'phone.svg;',
					 d, d * 0.79, '', 'Phone', false, null, this.getTagsForStencil(gn, 'phone', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'printer.svg;',
					 d, d * 0.66, '', 'Printer', false, null, this.getTagsForStencil(gn, 'printer', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'router.svg;',
					 d, d * 0.76, '', 'Router', false, null, this.getTagsForStencil(gn, 'router', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'secure.svg;',
					 d * 0.64, d, '', 'Secure', false, null, this.getTagsForStencil(gn, 'secure', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'security.svg;',
					 d * 0.63, d, '', 'Security', false, null, this.getTagsForStencil(gn, 'security', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'server_farm.svg;',
					 d, d, '', 'Server Farm', false, null, this.getTagsForStencil(gn, 'server farm', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'shadowed_router.svg;',
					 d * 0.82, d, '', 'Shadowed Router', false, null, this.getTagsForStencil(gn, 'shadowed router', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'site_collection.svg;',
					 d, d * 0.94, '', 'Site Collection', false, null, this.getTagsForStencil(gn, 'site collection', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'sql_server.svg;',
					 d * 0.77, d, '', 'SQL Server', false, null, this.getTagsForStencil(gn, 'sql server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'sub_site.svg;',
					 d, d * 0.86, '', 'Sub-site', false, null, this.getTagsForStencil(gn, 'sub site', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'switch.svg;',
					 d, d, '', 'Switch', false, null, this.getTagsForStencil(gn, 'switch', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'tablet_pc.svg;',
					 d * 0.73, d, '', 'Tablet PC', false, null, this.getTagsForStencil(gn, 'tablet pc', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'tunnel.svg;',
					 d, d * 0.2, '', 'Tunnel', false, null, this.getTagsForStencil(gn, 'tunnel', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'user.svg;',
					 d * 0.37, d, '', 'User', false, null, this.getTagsForStencil(gn, 'user', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'user_accounts.svg;',
					 d, d * 0.97, '', 'User Accounts', false, null, this.getTagsForStencil(gn, 'user accounts', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'users.svg;',
					 d * 0.66, d, '', 'Users', false, null, this.getTagsForStencil(gn, 'users', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'vista_client.svg;',
					 d * 0.76, d, '', 'Vista Client', false, null, this.getTagsForStencil(gn, 'vista client', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'vista_terminal.svg;',
					 d * 0.65, d, '', 'Vista Terminal', false, null, this.getTagsForStencil(gn, 'vista terminal', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'web_server.svg;',
					 d * 0.8, d, '', 'Web Server', false, null, this.getTagsForStencil(gn, 'web server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'wiki_site.svg;',
					 d, d, '', 'Wiki Site', false, null, this.getTagsForStencil(gn, 'wiki site', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'windows_domain.svg;',
					 d, d * 0.85, '', 'Windows Domain', false, null, this.getTagsForStencil(gn, 'windows domain', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'windows_router.svg;',
					 d * 0.8, d, '', 'Windows Router', false, null, this.getTagsForStencil(gn, 'windows router', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'windows_server.svg;',
					 d * 0.82, d, '', 'Windows Server', false, null, this.getTagsForStencil(gn, 'windows server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'windows_server_2.svg;',
					 d * 0.8, d, '', 'Windows Server', false, null, this.getTagsForStencil(gn, 'windows server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'wiring_hub.svg;',
					 d, d * 0.68, '', 'Wiring Hub', false, null, this.getTagsForStencil(gn, 'wiring hub', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'workspace_site.svg;',
					 d, d * 0.97, '', 'Workspace Site', false, null, this.getTagsForStencil(gn, 'workspace site', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'workstation_client.svg;',
					 d * 0.85, d, '', 'Workstation Client', false, null, this.getTagsForStencil(gn, 'workstation client', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'writer.svg;',
					 d * 0.96, d, '', 'Writer', false, null, this.getTagsForStencil(gn, 'writer', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'writing.svg;',
					 d * 0.98, d, '', 'Writing', false, null, this.getTagsForStencil(gn, 'writing', dt).join(' '))
		];

   		this.addPalette('active_directory', '活动目录', false, mxUtils.bind(this, function(content) {
			for (var i = 0; i < fns.length; i++) {
				content.appendChild(fns[i](content));
			}
		}));

	};

    Sidebar.prototype.addKubernetesPalette = function(expand){
		var w = 100;
		var h = 100;
		var s = 'sketch=0;html=1;dashed=0;whitespace=wrap;fillColor=#2875E2;strokeColor=#ffffff;points=[[0.005,0.63,0],[0.1,0.2,0],[0.9,0.2,0],[0.5,0,0],[0.995,0.63,0],[0.72,0.99,0],[0.5,1,0],[0.28,0.99,0]];verticalLabelPosition=bottom;align=center;verticalAlign=top;shape=mxgraph.kubernetes.';
		var gn = 'mxgraph.kubernetes';
		var dt = 'kubernetes ';
		this.addPaletteFunctions('kubernetes', '容器编排', false, [
			this.createVertexTemplateEntry(s + 'icon;prIcon=api', w * 0.5, h * 0.48, '', 'API', null, null, this.getTagsForStencil(gn, 'api application programming interface', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=c_c_m', w * 0.5, h * 0.48, '', 'C-C-M', null, null, this.getTagsForStencil(gn, 'ccm', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=c_m', w * 0.5, h * 0.48, '', 'C-M', null, null, this.getTagsForStencil(gn, 'cm', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=c_role', w * 0.5, h * 0.48, '', 'C-Role', null, null, this.getTagsForStencil(gn, 'crole role', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=cm', w * 0.5, h * 0.48, '', 'CM', null, null, this.getTagsForStencil(gn, 'cm', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=crb', w * 0.5, h * 0.48, '', 'CRB', null, null, this.getTagsForStencil(gn, 'crb', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=crd', w * 0.5, h * 0.48, '', 'CRD', null, null, this.getTagsForStencil(gn, 'crd', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=cronjob', w * 0.5, h * 0.48, '', 'Cronjob', null, null, this.getTagsForStencil(gn, 'cronjob', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=deploy', w * 0.5, h * 0.48, '', 'Deploy', null, null, this.getTagsForStencil(gn, 'deploy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=ds', w * 0.5, h * 0.48, '', 'DS', null, null, this.getTagsForStencil(gn, 'ds', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=ep', w * 0.5, h * 0.48, '', 'EP', null, null, this.getTagsForStencil(gn, 'ep', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=etcd', w * 0.5, h * 0.48, '', 'ETCD', null, null, this.getTagsForStencil(gn, 'etcd', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=group', w * 0.5, h * 0.48, '', 'Group', null, null, this.getTagsForStencil(gn, 'group', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=hpa', w * 0.5, h * 0.48, '', 'HPA', null, null, this.getTagsForStencil(gn, 'hpa', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=ing', w * 0.5, h * 0.48, '', 'ING', null, null, this.getTagsForStencil(gn, 'ing', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=job', w * 0.5, h * 0.48, '', 'Job', null, null, this.getTagsForStencil(gn, 'job', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=k_proxy', w * 0.5, h * 0.48, '', 'K-Proxy', null, null, this.getTagsForStencil(gn, 'k proxy kproxy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=kubelet', w * 0.5, h * 0.48, '', 'Kubelet', null, null, this.getTagsForStencil(gn, 'kubelet', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=limits', w * 0.5, h * 0.48, '', 'Limits', null, null, this.getTagsForStencil(gn, 'limits', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=master', w * 0.5, h * 0.48, '', 'Master', null, null, this.getTagsForStencil(gn, 'master', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=netpol', w * 0.5, h * 0.48, '', 'Netpol', null, null, this.getTagsForStencil(gn, 'netpol', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=node', w * 0.5, h * 0.48, '', 'Node', null, null, this.getTagsForStencil(gn, 'node', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=ns', w * 0.5, h * 0.48, '', 'NS', null, null, this.getTagsForStencil(gn, 'ns', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=pod', w * 0.5, h * 0.48, '', 'Pod', null, null, this.getTagsForStencil(gn, 'pod', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=psp', w * 0.5, h * 0.48, '', 'PSP', null, null, this.getTagsForStencil(gn, 'psp', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=pv', w * 0.5, h * 0.48, '', 'PV', null, null, this.getTagsForStencil(gn, 'pv', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=pvc', w * 0.5, h * 0.48, '', 'PVC', null, null, this.getTagsForStencil(gn, 'pvc', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=quota', w * 0.5, h * 0.48, '', 'Quota', null, null, this.getTagsForStencil(gn, 'quota', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=rb', w * 0.5, h * 0.48, '', 'RB', null, null, this.getTagsForStencil(gn, 'rb', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=role', w * 0.5, h * 0.48, '', 'Role', null, null, this.getTagsForStencil(gn, 'role', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=rs', w * 0.5, h * 0.48, '', 'RS', null, null, this.getTagsForStencil(gn, 'rs', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=sa', w * 0.5, h * 0.48, '', 'SA', null, null, this.getTagsForStencil(gn, 'sa', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=sc', w * 0.5, h * 0.48, '', 'SC', null, null, this.getTagsForStencil(gn, 'sc', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=sched', w * 0.5, h * 0.48, '', 'Sched', null, null, this.getTagsForStencil(gn, 'sched', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=secret', w * 0.5, h * 0.48, '', 'Secret', null, null, this.getTagsForStencil(gn, 'secret', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=sts', w * 0.5, h * 0.48, '', 'STS', null, null, this.getTagsForStencil(gn, 'sts', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=svc', w * 0.5, h * 0.48, '', 'SVC', null, null, this.getTagsForStencil(gn, 'svc', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=user', w * 0.5, h * 0.48, '', 'User', null, null, this.getTagsForStencil(gn, 'user', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'icon;prIcon=vol', w * 0.5, h * 0.48, '', 'Vol', null, null, this.getTagsForStencil(gn, 'vol', dt).join(' '))
		]);
    };

    Sidebar.prototype.addSalesforceProductPalette = function(expand) {
        const w = 60;
        const h = 60;
		var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;aspect=fixed;html=1;shape=mxgraph.salesforce.';
		var gn = 'mxgraph.salesforce';
		var dt = 'salesforce product ';
		this.addPaletteFunctions('salesforceProduct', '销售/产品', false,
		[
			this.createVertexTemplateEntry(s + 'sales;', w, h, '', 'Sales', null, null, this.getTagsForStencil(gn, 'sales', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'service;', w, h * 0.82, '', 'Service', null, null, this.getTagsForStencil(gn, 'service', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'marketing;', w, h, '', 'Marketing', null, null, this.getTagsForStencil(gn, 'marketing', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'commerce;', w, h * 0.88, '', 'Commerce', null, null, this.getTagsForStencil(gn, 'commerce', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'platform;', w * 0.65, h, '', 'Platform', null, null, this.getTagsForStencil(gn, 'platform', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'analytics;', w, h * 0.98, '', 'Analytics', null, null, this.getTagsForStencil(gn, 'salesforce', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'integration;', w, h, '', 'Integration', null, null, this.getTagsForStencil(gn, 'integration', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'employees;', w * 0.97, h, '', 'Employees', null, null, this.getTagsForStencil(gn, 'employees', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'learning;', w, h, '', 'Learning', null, null, this.getTagsForStencil(gn, 'learning', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'industries;', w * 0.89, h, '', 'Industries', null, null, this.getTagsForStencil(gn, 'industries', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'partners;', w, h, '', 'Partners', null, null, this.getTagsForStencil(gn, 'partners', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'success;', w * 0.68, h, '', 'Success', null, null, this.getTagsForStencil(gn, 'success', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'inbox;', w, h * 0.75, '', 'Inbox', null, null, this.getTagsForStencil(gn, 'inbox', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'field_service;', w * 0.75, h, '', 'Field Service', null, null, this.getTagsForStencil(gn, 'field service', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'iot;', w, h, '', 'IoT', null, null, this.getTagsForStencil(gn, 'iot', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'social_studio;', w, h, '', 'Social Studio', null, null, this.getTagsForStencil(gn, 'social studio', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'customer_360;', w, h * 0.91, '', 'Customer 360', null, null, this.getTagsForStencil(gn, 'customer 360', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'heroku;', w, h, '', 'Heroku', null, null, this.getTagsForStencil(gn, 'heroku', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'work_com;', w, h * 0.98, '', 'Work.com', null, null, this.getTagsForStencil(gn, 'work com', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'loyalty;', w, h * 0.68, '', 'Loyalty', null, null, this.getTagsForStencil(gn, 'loyalty', dt).join(' ')),

			this.createVertexTemplateEntry(s + 'sales2;', w, h, '', 'Sales', null, null, this.getTagsForStencil(gn, 'sales', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'service2;', w, h, '', 'Service', null, null, this.getTagsForStencil(gn, 'service', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'marketing2;', w, h, '', 'Marketing', null, null, this.getTagsForStencil(gn, 'marketing', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'commerce2;', w, h, '', 'Commerce', null, null, this.getTagsForStencil(gn, 'commerce', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'platform2;', w, h, '', 'Platform', null, null, this.getTagsForStencil(gn, 'platform', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'analytics2;', w, h, '', 'Analytics', null, null, this.getTagsForStencil(gn, 'salesforce', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'integration2;', w, h, '', 'Integration', null, null, this.getTagsForStencil(gn, 'integration', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'employees2;', w, h, '', 'Employees', null, null, this.getTagsForStencil(gn, 'employees', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'learning2;', w, h, '', 'Learning', null, null, this.getTagsForStencil(gn, 'learning', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'industries2;', w, h, '', 'Industries', null, null, this.getTagsForStencil(gn, 'industries', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'partners2;', w, h, '', 'Partners', null, null, this.getTagsForStencil(gn, 'partners', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'success2;', w, h, '', 'Success', null, null, this.getTagsForStencil(gn, 'success', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'inbox2;', w, h, '', 'Inbox', null, null, this.getTagsForStencil(gn, 'inbox', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'field_service2;', w, h, '', 'Field Service', null, null, this.getTagsForStencil(gn, 'field service', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'iot2;', w, h, '', 'IoT', null, null, this.getTagsForStencil(gn, 'iot', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'social_studio2;', w, h, '', 'Social Studio', null, null, this.getTagsForStencil(gn, 'social studio', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'customer_3602;', w, h, '', 'Customer 360', null, null, this.getTagsForStencil(gn, 'customer 360', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'heroku2;', w, h, '', 'Heroku', null, null, this.getTagsForStencil(gn, 'heroku', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'work_com2;', w, h, '', 'Work.com', null, null, this.getTagsForStencil(gn, 'work com', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'loyalty2;', w, h, '', 'Loyalty', null, null, this.getTagsForStencil(gn, 'loyalty', dt).join(' '))
		]);
	};

    Sidebar.prototype.addSalesforcePlatformPalette = function(expand) {
        const w = 60;
        const h = 60;
		var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;aspect=fixed;html=1;shape=mxgraph.salesforce.';
		var gn = 'mxgraph.salesforce';
		var dt = 'salesforce platform ';
		this.addPaletteFunctions('salesforcePlatform', '销售 / 平台', false,
		[
			this.createVertexTemplateEntry(s + 'apps;', w * 0.57, h, '', 'Apps', null, null, this.getTagsForStencil(gn, 'apps', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'web;', w, h * 0.79, '', 'Web', null, null, this.getTagsForStencil(gn, 'web', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'channels;', w, h, '', 'Channels', null, null, this.getTagsForStencil(gn, 'channels', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'bots;', w, h * 0.95, '', 'Bots', null, null, this.getTagsForStencil(gn, 'bots', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'automation;', w, h * 0.97, '', 'Automation', null, null, this.getTagsForStencil(gn, 'automation', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'workflow;', w, h, '', 'Workflow', null, null, this.getTagsForStencil(gn, 'workflow', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'personalization;', w, h * 0.75, '', 'Personalization', null, null, this.getTagsForStencil(gn, 'personalization', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'builders;', w * 0.92, h, '', 'Builders', null, null, this.getTagsForStencil(gn, 'builders', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'data;', w * 0.81, h, '', 'Data', null, null, this.getTagsForStencil(gn, 'data', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'stream;', w, h, '', 'Stream', null, null, this.getTagsForStencil(gn, 'stream', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'segments;', w, h, '', 'Segments', null, null, this.getTagsForStencil(gn, 'segments', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'privacy;', w * 0.77, h, '', 'Privacy', null, null, this.getTagsForStencil(gn, 'privacy', dt).join(' ')),

			this.createVertexTemplateEntry(s + 'apps2;', w, h, '', 'Apps', null, null, this.getTagsForStencil(gn, 'apps', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'web2;', w, h, '', 'Web', null, null, this.getTagsForStencil(gn, 'web', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'channels2;', w, h, '', 'Channels', null, null, this.getTagsForStencil(gn, 'channels', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'bots2;', w, h, '', 'Bots', null, null, this.getTagsForStencil(gn, 'bots', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'automation2;', w, h, '', 'Automation', null, null, this.getTagsForStencil(gn, 'automation', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'workflow2;', w, h, '', 'Workflow', null, null, this.getTagsForStencil(gn, 'workflow', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'personalization2;', w, h, '', 'Personalization', null, null, this.getTagsForStencil(gn, 'personalization', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'builders2;', w, h, '', 'Builders', null, null, this.getTagsForStencil(gn, 'builders', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'data2;', w, h, '', 'Data', null, null, this.getTagsForStencil(gn, 'data', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'stream2;', w, h, '', 'Stream', null, null, this.getTagsForStencil(gn, 'stream', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'segments2;', w, h, '', 'Segments', null, null, this.getTagsForStencil(gn, 'segments', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'privacy2;', w, h, '', 'Privacy', null, null, this.getTagsForStencil(gn, 'privacy', dt).join(' '))
		]);
	};

	Sidebar.prototype.addSalesforceIndustryPalette = function(expand) {
        const w = 60;
        const h = 60;
		var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;aspect=fixed;html=1;shape=mxgraph.salesforce.';
		var gn = 'mxgraph.salesforce';
		var dt = 'salesforce industry';
		this.addPaletteFunctions('salesforceIndustry', '销售 / 工业', false,
		[
			this.createVertexTemplateEntry(s + 'government;', w * 0.86, h, '', 'Government', null, null, this.getTagsForStencil(gn, 'government', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'media;', w, h, '', 'Media', null, null, this.getTagsForStencil(gn, 'media', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'consumer_goods;', w * 0.9, h, '', 'Consumer Goods', null, null, this.getTagsForStencil(gn, 'consumer goods', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'transportation_and_technology;', w, h, '', 'Transportation and Technology', null, null, this.getTagsForStencil(gn, 'transportation and technology', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'financial_services;', w * 0.96, h, '', 'Financial Services', null, null, this.getTagsForStencil(gn, 'financial services', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'automotive;', w, h, '', 'Automotive', null, null, this.getTagsForStencil(gn, 'automotive', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'energy;', w * 0.75, h, '', 'Energy', null, null, this.getTagsForStencil(gn, 'energy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'smb;', w, h * 0.82, '', 'SMB', null, null, this.getTagsForStencil(gn, 'smb', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'communications;', w * 0.79, h, '', 'Communications', null, null, this.getTagsForStencil(gn, 'communications', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'retail;', w * 0.75, h, '', 'Retail', null, null, this.getTagsForStencil(gn, 'retail', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'manufacturing;', w, h, '', 'Manufacturing', null, null, this.getTagsForStencil(gn, 'manufacturing', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'health;', w, h * 0.84, '', 'Health', null, null, this.getTagsForStencil(gn, 'health', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'philantrophy;', w * 0.83, h, '', 'Philantrophy', null, null, this.getTagsForStencil(gn, 'philantrophy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'non_profit;', w, h * 0.93, '', 'Non-profit', null, null, this.getTagsForStencil(gn, 'non profit', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'education;', w, h * 0.67, '', 'Education', null, null, this.getTagsForStencil(gn, 'education', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'sustainability;', w, h, '', 'Sustainability', null, null, this.getTagsForStencil(gn, 'sustainability', dt).join(' ')),

			this.createVertexTemplateEntry(s + 'government2;', w, h, '', 'Government', null, null, this.getTagsForStencil(gn, 'government', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'media2;', w, h, '', 'Media', null, null, this.getTagsForStencil(gn, 'media', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'consumer_goods2;', w, h, '', 'Consumer Goods', null, null, this.getTagsForStencil(gn, 'consumer goods', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'transportation_and_technology2;', w, h, '', 'Transportation and Technology', null, null, this.getTagsForStencil(gn, 'transportation and technology', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'financial_services2;', w, h, '', 'Financial Services', null, null, this.getTagsForStencil(gn, 'financial services', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'automotive2;', w, h, '', 'Automotive', null, null, this.getTagsForStencil(gn, 'automotive', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'energy2;', w, h, '', 'Energy', null, null, this.getTagsForStencil(gn, 'energy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'smb2;', w, h, '', 'SMB', null, null, this.getTagsForStencil(gn, 'smb', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'communications2;', w, h, '', 'Communications', null, null, this.getTagsForStencil(gn, 'communications', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'retail2;', w, h, '', 'Retail', null, null, this.getTagsForStencil(gn, 'retail', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'manufacturing2;', w, h, '', 'Manufacturing', null, null, this.getTagsForStencil(gn, 'manufacturing', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'health2;', w, h, '', 'Health', null, null, this.getTagsForStencil(gn, 'health', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'philantrophy2;', w, h, '', 'Philantrophy', null, null, this.getTagsForStencil(gn, 'philantrophy', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'non_profit2;', w, h, '', 'Non-profit', null, null, this.getTagsForStencil(gn, 'non profit', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'education2;', w, h, '', 'Education', null, null, this.getTagsForStencil(gn, 'education', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'sustainability2;', w, h, '', 'Sustainability', null, null, this.getTagsForStencil(gn, 'sustainability', dt).join(' '))
		]);
	};

    Sidebar.prototype.addAlliedTelesisPalette = function(){
		var d = 60;
		var dt = 'allied telesis';
		var sb = this;
		var s = 'image;points=[];aspect=fixed;html=1;align=center;shadow=0;dashed=0;image=' + mxUtils.staticImg('/rcscada/img/allied_telesis/');
		this.addAlliedTelesisBuildingsPalette(d, dt, sb, s);
		this.addAlliedTelesisComputerTerminalsPalette(d, dt, sb, s);
		this.addAlliedTelesisMediaConvertersPalette(d, dt, sb, s);
		this.addAlliedTelesisSecurityPalette(d, dt, sb, s);
		this.addAlliedTelesisStoragePalette(d, dt, sb, s);
		this.addAlliedTelesisSwitchPalette(d, dt, sb, s);
		this.addAlliedTelesisWirelessPalette(d, dt, sb, s);
	};

    Sidebar.prototype.addAlliedTelesisBuildingsPalette = function(d, dt, sb, s){
		s += 'buildings/';
		var gn = 'buildings';

		var fns = [
			 this.createVertexTemplateEntry(s + 'Apartments.svg;',
					 d * 0.9, d * 1.75, '', 'Apartments', false, null, this.getTagsForStencil(gn, 'apartments', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Building_Cluster.svg;',
					 d * 2.02, d * 1.85, '', 'Building Cluster', false, null, this.getTagsForStencil(gn, 'building cluster', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Large_Building.svg;',
					 d * 1.25, d * 1.25, '', 'Large Building', false, null, this.getTagsForStencil(gn, 'large building', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Long_Building.svg;',
					 d * 2.09, d * 2.16, '', 'Long Building', false, null, this.getTagsForStencil(gn, 'long building', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Medium_Business_Building.svg;',
					 d * 0.91, d * 1.17, '', 'Medium Business Building', false, null, this.getTagsForStencil(gn, 'medium business building', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'School_Building.svg;',
					 d * 2.75, d * 2.78, '', 'School Building', false, null, this.getTagsForStencil(gn, 'school building', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Secure_Building.svg;',
					 d * 2.72, d * 1.86, '', 'Secure Building', false, null, this.getTagsForStencil(gn, 'secure building', dt).join(' '))
		];

   		this.addPalette('allied_telesisBuildings', '联合 / 建筑', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisComputerTerminalsPalette = function(d, dt, sb, s){
		s += 'computer_and_terminals/';
		var gn = 'computer terminals';

		var fns = [
			 this.createVertexTemplateEntry(s + 'IP_TV.svg;',
					 d * 0.82, d * 0.84, '', 'IP TV', false, null, this.getTagsForStencil(gn, 'ip tv internet protocol television', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Keypad.svg;',
					 d * 0.44, d * 0.8, '', 'Keypad', false, null, this.getTagsForStencil(gn, 'keypad', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Laptop.svg;',
					 d * 0.7, d * 0.71, '', 'Laptop', false, null, this.getTagsForStencil(gn, 'laptop', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Personal_Computer.svg;',
					 d * 0.76, d * 1.03, '', 'Personal Computer', false, null, this.getTagsForStencil(gn, 'personal computer', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Personal_Computer_Wireless.svg;',
					 d * 1.05, d * 1.07, '', 'Personal Computer Wireless', false, null, this.getTagsForStencil(gn, 'personal computer wireless', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Personal_Computer_with_Server.svg;',
					 d * 1.04, d * 1.04, '', 'Personal Computer with Server', false, null, this.getTagsForStencil(gn, 'Personal Computer Server', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'POS_keypad.svg;',
					 d * 0.62, d * 0.46, '', 'POS Keypad', false, null, this.getTagsForStencil(gn, 'pos keypad', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'POS_Printer.svg;',
					 d * 0.62, d * 0.54, '', 'POS Printer', false, null, this.getTagsForStencil(gn, 'pos printer', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Server_Desktop.svg;',
					 d * 0.71, d * 0.90, '', 'Server Desktop', false, null, this.getTagsForStencil(gn, 'server desktop', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Smartphone.svg;',
					 d * 0.33, d * 0.72, '', 'Smartphone', false, null, this.getTagsForStencil(gn, 'smartphone', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Tablet.svg;',
					 d * 0.45, d * 0.95, '', 'Tablet', false, null, this.getTagsForStencil(gn, 'tablet', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Tablet_Alternative.svg;',
					 d * 0.58, d * 0.8, '', 'Tablet Alternative', false, null, this.getTagsForStencil(gn, 'tablet alternative', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Vdeo_Conference_Terminal.svg;',
					 d * 0.53, d * 0.75, '', 'Vdeo Conference Terminal', false, null, this.getTagsForStencil(gn, 'vdeo conference terminal', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'VOIP_IP_phone.svg;',
					 d * 0.5, d * 0.76, '', 'VOIP IP Phone', false, null, this.getTagsForStencil(gn, 'voip ip phone voice over internet protocol', dt).join(' '))
		];

   		this.addPalette('allied_telesisComputer and Terminals', '联合 / 计算机和终端', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisMediaConvertersPalette = function(d, dt, sb, s){
		s += 'media_converters/';
		var gn = 'media converters';

		var fns = [
			 this.createVertexTemplateEntry(s + 'Industrial_Media_Converter.svg;',
					 d * 0.5, d * 0.95, '', 'Industrial Media Converter', false, null, this.getTagsForStencil(gn, 'industrial media converter', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Industrial_Media_Converter_POE.svg;',
					 d * 0.5, d * 0.95, '', 'Industrial Media Converter POE', false, null, this.getTagsForStencil(gn, 'industrial media converter poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Media_Converter_Modular.svg;',
					 d * 1.18, d * 0.91, '', 'Media Converter Modular', false, null, this.getTagsForStencil(gn, 'media converter modular', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Media_Converter_Standalone.svg;',
					 d * 0.76, d * 0.62, '', 'Media Converter Standalone', false, null, this.getTagsForStencil(gn, 'media converter standalone', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Media_Converter_Standalone_POE.svg;',
					 d * 0.76, d * 0.62, '', 'Media Converter Standalone POE', false, null, this.getTagsForStencil(gn, 'media converter standalone poe', dt).join(' '))
		];

   		this.addPalette('allied_telesisMedia Converters', '联合 / 媒体转换器', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisSecurityPalette = function(d, dt, sb, s){
		s += 'security/';
		var gn = 'security';

		var fns = [
			 this.createVertexTemplateEntry(s + 'DVS_Surveillance_Monitor.svg;',
					 d * 0.7, d * 1, '', 'DVS Surveillance Monitor', false, null, this.getTagsForStencil(gn, 'dvs surveillance monitor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'EtherGRID.svg;',
					 d * 1.49, d * 1.08, '', 'EtherGRID', false, null, this.getTagsForStencil(gn, 'ethergrid', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'POE_DVS_Camera.svg;',
					 d * 0.85, d * 0.67, '', 'POE DVS Camera', false, null, this.getTagsForStencil(gn, 'poe dvs camera', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'POS.svg;',
					 d * 1.13, d * 1.2, '', 'POS', false, null, this.getTagsForStencil(gn, 'pos', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Router_UTM.svg;',
					 d * 0.93, d * 0.66, '', 'Router UTM', false, null, this.getTagsForStencil(gn, 'router utm', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Router_VPN.svg;',
					 d * 0.93, d * 0.66, '', 'Router VPN', false, null, this.getTagsForStencil(gn, 'router vpn', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Surveillance_Camera_Ceiling.svg;',
					 d * 0.62, d * 0.59, '', 'Surveillance Camera Ceiling', false, null, this.getTagsForStencil(gn, 'surveillance camera ceiling', dt).join(' '))
		];

   		this.addPalette('allied_telesisSecurity', '联合 / 安全', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisStoragePalette = function(d, dt, sb, s){
		s += 'storage/';
		var gn = 'storage';

		var fns = [
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Half_Rack_ToR.svg;',
					 d * 1.47, d * 1.91, '', 'Datacenter Server Half Rack ToR', false, null, this.getTagsForStencil(gn, 'datacenter server half rack tor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Rack.svg;',
					 d * 1.47, d * 2.98, '', 'Datacenter Server Rack', false, null, this.getTagsForStencil(gn, 'datacenter server rack', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Rack_EoR.svg;',
					 d * 1.43, d * 2.89, '', 'Datacenter Server Rack EoR', false, null, this.getTagsForStencil(gn, 'datacenter server rack eor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Rack_Storage_Unit_Small.svg;',
					 d * 1.29, d * 1.12, '', 'Datacenter Server Rack Storage Unit Small', false, null, this.getTagsForStencil(gn, 'datacenter server rack storage unit small', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Rack_ToR.svg;',
					 d * 1.47, d * 2.98, '', 'Datacenter Server Rack ToR', false, null, this.getTagsForStencil(gn, 'datacenter server rack tor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Datacenter_Server_Storage_Unit_Large.svg;',
					 d * 1.28, d * 1.32, '', 'Datacenter Server Storage Unit Large', false, null, this.getTagsForStencil(gn, 'datacenter server storage unit large', dt).join(' '))
		];

   		this.addPalette('allied_telesisStorage', '联合 / 存储', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisSwitchPalette = function(d, dt, sb, s){
		s += 'switch/';
		var gn = 'switch';

		var fns = [
			 this.createVertexTemplateEntry(s + 'Industrial_Ethernet_IE200.svg;',
					 d * 0.67, d * 0.94, '', 'Industrial Ethernet IE200', false, null, this.getTagsForStencil(gn, 'industrial ethernet ie200', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Industrial_Ethernet_IE200_POE.svg;',
					 d * 0.67, d * 0.94, '', 'Industrial Ethernet IE200 POE', false, null, this.getTagsForStencil(gn, 'industrial ethernet ie200 poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Industrial_Ethernet_IE300.svg;',
					 d * 1.16, d * 1.29, '', 'Industrial_Ethernet_IE300', false, null, this.getTagsForStencil(gn, 'industrial ethernet ie300', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Modular_Switch_SBx8106.svg;',
					 d * 1.43, d * 1.23, '', 'Modular Switch SBx8106', false, null, this.getTagsForStencil(gn, 'modular switch sbx8106', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Modular_Switch_SBx8112.svg;',
					 d * 1.49, d * 1.53, '', 'Modular Switch SBx8112', false, null, this.getTagsForStencil(gn, 'modular switch sbx8112', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Modular_Switch_SXx908GEN2.svg;',
					 d * 1.3, d * 1.11, '', 'Modular Switch SXx908GEN2', false, null, this.getTagsForStencil(gn, 'modular switch sxx908gen2', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_24_port_L2.svg;',
					 d * 1.24, d * 0.85, '', 'Switch 24 port L2', false, null, this.getTagsForStencil(gn, 'switch 24 port l2', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_24_port_L2_POE.svg;',
					 d * 1.24, d * 0.85, '', 'Switch 24 port L2 POE', false, null, this.getTagsForStencil(gn, 'switch 24 port l2 poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_24_port_L3.svg;',
					 d * 1.24, d * 0.85, '', 'Switch 24 port L3', false, null, this.getTagsForStencil(gn, 'switch 24 port l3', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_24_port_L3_Alternative.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 24 port L3 Alternative', false, null, this.getTagsForStencil(gn, 'switch 24 port l3 alternative', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_24_port_L3_POE.svg;',
					 d * 1.24, d * 0.85, '', 'Switch 24 port L3 POE', false, null, this.getTagsForStencil(gn, 'switch 24 port l3 poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_48_port_L2.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 48 port L2', false, null, this.getTagsForStencil(gn, 'switch 48 port l2', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_48_port_L2_POE.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 48 port L2 POE', false, null, this.getTagsForStencil(gn, 'switch 48 port l2 poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_48_port_L3.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 48 port L3', false, null, this.getTagsForStencil(gn, 'switch 48 port l3', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_48_port_L3_POE.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 48 port L3 POE', false, null, this.getTagsForStencil(gn, 'switch 48 port l3 poe', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Switch_52_port_L3.svg;',
					 d * 1.3, d * 0.88, '', 'Switch 52 port L3', false, null, this.getTagsForStencil(gn, 'switch 52 port l3', dt).join(' '))
		];

   		this.addPalette('allied_telesisSwitch', '联合 / 转换', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

	Sidebar.prototype.addAlliedTelesisWirelessPalette = function(d, dt, sb, s){
		s += 'wireless/';
		var gn = 'wireless';

		var fns = [
			 this.createVertexTemplateEntry(s + 'Access_Point_Indoor.svg;',
					 d * 0.61, d * 0.91, '', 'Access Point Indoor', false, null, this.getTagsForStencil(gn, 'access point indoor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Access_Point_Outdoor.svg;',
					 d * 0.43, d * 1.66, '', 'Access Point Outdoor', false, null, this.getTagsForStencil(gn, 'access point outdoor', dt).join(' ')),
			 this.createVertexTemplateEntry(s + 'Laptop_Wireless.svg;',
					 d * 0.96, d * 0.79, '', 'Laptop Wireless', false, null, this.getTagsForStencil(gn, 'laptop wireless', dt).join(' '))
		];

   		this.addPalette('allied_telesisWireless', '联合 / 无线的', false, mxUtils.bind(this, function(content)
	    {
			for (var i = 0; i < fns.length; i++)
			{
				content.appendChild(fns[i](content));
			}
		}));
	};

})();
