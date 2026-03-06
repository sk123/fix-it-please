import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ExternalLink, MapPin, AlertTriangle, Search } from 'lucide-react';
import { getSettings } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';
import { getStateOptions } from '../utils/stateRepairRules';

const NATIONAL_RESOURCES = [
    { name: '211 — United Way Helpline', phone: '211', url: 'https://www.211.org/', desc: 'Free referrals to local services including legal aid, housing, and emergency assistance.' },
    { name: 'LawHelp.org', phone: null, url: 'https://www.lawhelp.org/', desc: 'Find free legal aid programs in your state. Run by Pro Bono Net.' },
    { name: 'Legal Services Corporation', phone: null, url: 'https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help', desc: 'The largest single funder of civil legal aid in the U.S. Find grantees near you.' },
    { name: 'HUD Housing Counseling', phone: '1-800-569-4287', url: 'https://www.hud.gov/counseling', desc: 'Free housing counseling from HUD-approved agencies.' },
    { name: 'National Housing Law Project', phone: null, url: 'https://www.nhlp.org/', desc: 'Tenant rights resources and policy information.' },
];

const STATE_LEGAL_AID = {
    'Alabama': [
        { name: 'Legal Services Alabama', phone: '1-866-456-4995', url: 'https://www.legalservicesalabama.org/', desc: 'Statewide free legal help for low-income Alabamians including housing and eviction defense.' },
        { name: 'Alabama State Bar Volunteer Lawyers', phone: '334-269-1515', url: 'https://www.alabar.org/vlp/', desc: 'Pro bono legal help from volunteer attorneys.' },
    ],
    'Alaska': [
        { name: 'Alaska Legal Services Corporation', phone: '1-888-478-2572', url: 'https://www.alsc-law.org/', desc: 'Free civil legal aid for low-income Alaskans. Handles landlord-tenant disputes.' },
        { name: 'Alaska Law Help', phone: null, url: 'https://www.alaskalawhelp.org/', desc: 'Self-help legal information and forms for Alaska renters.' },
    ],
    'Arizona': [
        { name: 'Community Legal Services (Phoenix)', phone: '1-800-852-9075', url: 'https://clsaz.org/', desc: 'Free legal aid for Maricopa County and statewide housing issues.' },
        { name: 'Southern Arizona Legal Aid', phone: '1-800-640-9465', url: 'https://www.sazlegalaid.org/', desc: 'Free legal services for southern AZ including Tucson metro.' },
        { name: 'Arizona Tenants Union', phone: null, url: 'https://www.arizonatenantsunion.org/', desc: 'Tenant advocacy, know-your-rights workshops, and complaint assistance.' },
    ],
    'Arkansas': [
        { name: 'Legal Aid of Arkansas', phone: '1-800-952-9243', url: 'https://arlegalaid.org/', desc: 'Statewide free legal help including eviction defense and housing conditions.' },
        { name: 'Center for Arkansas Legal Services', phone: '1-800-950-5817', url: 'https://www.arkansaslegalservices.org/', desc: 'Civil legal aid for central and eastern Arkansas.' },
    ],
    'California': [
        { name: 'Legal Aid Foundation of Los Angeles', phone: '1-800-399-4529', url: 'https://lafla.org/', desc: 'Free legal services for low-income LA County residents. Major tenant rights provider.' },
        { name: 'Bay Area Legal Aid', phone: '1-800-551-5554', url: 'https://bfrls.org/', desc: 'Free legal help for SF Bay Area including housing and eviction defense.' },
        { name: 'California Rural Legal Assistance', phone: '1-800-337-0690', url: 'https://www.crla.org/', desc: 'Legal services for rural California renters and farmworkers.' },
        { name: 'Tenants Together', phone: null, url: 'https://www.tenantstogether.org/', desc: 'Statewide tenant rights organization with hotline and resources.' },
    ],
    'Colorado': [
        { name: 'Colorado Legal Services', phone: '1-844-625-2667', url: 'https://coloradolegalservices.org/', desc: 'Statewide free legal aid for housing, eviction defense, and habitability issues.' },
        { name: 'Denver Metro Volunteer Lawyers', phone: '303-830-8210', url: 'https://www.denbar.org/public/lawyerreferral', desc: 'Pro bono legal help from volunteer attorneys in greater Denver.' },
    ],
    'Connecticut': [
        { name: 'Statewide Legal Services of CT', phone: '1-800-453-3320', url: 'https://slsct.org/', desc: 'Intake hotline for all free legal services in Connecticut. Start here.' },
        { name: 'Connecticut Legal Services', phone: '1-800-453-3320', url: 'https://ctlegal.org/', desc: 'Free legal help for low-income CT residents including eviction cases.' },
        { name: 'Greater Hartford Legal Aid', phone: '860-541-5000', url: 'https://ghla.org/', desc: 'Free legal services for Hartford area residents.' },
    ],
    'Delaware': [
        { name: 'Community Legal Aid Society (CLASI)', phone: '302-575-0660', url: 'https://www.declasi.org/', desc: 'Free legal help for Delawareans including housing discrimination and eviction.' },
        { name: 'Delaware Volunteer Legal Services', phone: '302-478-8680', url: 'https://www.dvls.org/', desc: 'Pro bono legal services from volunteer attorneys.' },
    ],
    'District of Columbia': [
        { name: 'Legal Aid Society of DC', phone: '202-628-1161', url: 'https://www.legalaiddc.org/', desc: 'Free legal services for DC residents facing housing issues and eviction.' },
        { name: 'Bread for the City Legal Clinic', phone: '202-265-2400', url: 'https://www.breadforthecity.org/', desc: 'Free legal clinics for DC residents including tenant rights.' },
        { name: 'DC Tenant Hotline (OTA)', phone: '202-719-6560', url: 'https://ota.dc.gov/', desc: 'DC Office of the Tenant Advocate — free help for all DC renters.' },
    ],
    'Florida': [
        { name: 'Florida Legal Services', phone: '1-800-405-1417', url: 'https://www.floridalegal.org/', desc: 'Statewide legal aid coordination. Can connect you with your local provider.' },
        { name: 'Legal Aid Service of Broward County', phone: '954-765-8950', url: 'https://www.legalaid.org/', desc: 'Free legal help for Broward County residents.' },
        { name: 'Community Legal Services of Mid-Florida', phone: '1-800-405-1417', url: 'https://clsmf.org/', desc: 'Legal aid for central Florida covering 12 counties.' },
    ],
    'Georgia': [
        { name: 'Georgia Legal Services Program', phone: '1-800-498-9469', url: 'https://www.glsp.org/', desc: 'Free legal help for low-income Georgians outside metro Atlanta.' },
        { name: 'Atlanta Legal Aid Society', phone: '404-524-5811', url: 'https://www.atlantalegalaid.org/', desc: 'Free legal services for metro Atlanta area including housing.' },
    ],
    'Hawaii': [
        { name: 'Legal Aid Society of Hawaii', phone: '1-800-499-4302', url: 'https://www.legalaidhawaii.org/', desc: 'Statewide free legal help including landlord-tenant and housing conditions.' },
        { name: 'Volunteer Legal Services Hawaii', phone: '808-528-7046', url: 'https://www.vlsh.org/', desc: 'Pro bono legal help from volunteer attorneys.' },
    ],
    'Idaho': [
        { name: 'Idaho Legal Aid Services', phone: '1-866-345-0106', url: 'https://www.idaholegalaid.org/', desc: 'Statewide free legal services for housing, eviction, and tenant rights.' },
        { name: 'Idaho Volunteer Lawyers Program', phone: '208-334-4510', url: 'https://isb.idaho.gov/vlp/', desc: 'Pro bono legal help from volunteer attorneys.' },
    ],
    'Illinois': [
        { name: 'Legal Aid Chicago', phone: '312-341-1070', url: 'https://www.legalaidchicago.org/', desc: 'Free legal help for Cook County residents including eviction defense.' },
        { name: 'Land of Lincoln Legal Aid', phone: '1-877-342-7891', url: 'https://lollaf.org/', desc: 'Free legal services for central and southern Illinois.' },
        { name: 'Metropolitan Tenants Organization', phone: '773-292-4980', url: 'https://www.tenants-rights.org/', desc: 'Chicago tenant rights organization with hotline and organizing.' },
    ],
    'Indiana': [
        { name: 'Indiana Legal Services', phone: '1-800-869-0212', url: 'https://www.indianalegalservices.org/', desc: 'Statewide free legal aid for housing, eviction defense, and tenant rights.' },
        { name: 'Neighborhood Christian Legal Clinic', phone: '317-429-4131', url: 'https://www.nclegalclinic.org/', desc: 'Free legal help in central Indiana.' },
    ],
    'Iowa': [
        { name: 'Iowa Legal Aid', phone: '1-800-532-1275', url: 'https://www.iowalegalaid.org/', desc: 'Statewide free legal help including housing, eviction defense, and repairs.' },
    ],
    'Kansas': [
        { name: 'Kansas Legal Services', phone: '1-800-723-6953', url: 'https://www.kansaslegalservices.org/', desc: 'Statewide free legal services including landlord-tenant and housing conditions.' },
    ],
    'Kentucky': [
        { name: 'Legal Aid Society of Louisville', phone: '502-584-1254', url: 'https://www.laslou.org/', desc: 'Free legal services for the Louisville metro area.' },
        { name: 'Kentucky Legal Aid', phone: '1-866-452-9243', url: 'https://klaid.org/', desc: 'Legal aid for central, eastern, and western Kentucky.' },
        { name: 'AppalReD Legal Aid', phone: '1-866-277-2733', url: 'https://www.ardfky.org/', desc: 'Free legal help for eastern Kentucky including housing issues.' },
    ],
    'Louisiana': [
        { name: 'Southeast Louisiana Legal Services', phone: '1-800-310-7029', url: 'https://slls.org/', desc: 'Free legal services for southeast LA including New Orleans area.' },
        { name: 'Acadiana Legal Service Corporation', phone: '1-800-256-1175', url: 'https://www.la-law.org/', desc: 'Free legal help for southwest and central Louisiana.' },
    ],
    'Maine': [
        { name: 'Pine Tree Legal Assistance', phone: '207-774-8211', url: 'https://www.ptla.org/', desc: 'Statewide free legal help including housing, eviction defense, and habitability.' },
        { name: 'Volunteer Lawyers Project', phone: '207-774-4348', url: 'https://www.vlp.org/', desc: 'Pro bono legal services from volunteer attorneys.' },
    ],
    'Maryland': [
        { name: 'Maryland Legal Aid', phone: '410-539-5340', url: 'https://www.mdlab.org/', desc: 'Statewide free legal services for housing, tenant rights, and eviction defense.' },
        { name: 'Pro Bono Resource Center of MD', phone: '410-837-9379', url: 'https://www.probonomd.org/', desc: 'Connects low-income Marylanders with pro bono attorneys.' },
        { name: 'MD Tenants Rights Hotline', phone: '410-685-8210', url: null, desc: 'Call for help understanding your rights as a Maryland renter.' },
    ],
    'Massachusetts': [
        { name: 'Greater Boston Legal Services', phone: '617-371-1234', url: 'https://www.gbls.org/', desc: 'Free legal help for low-income Boston area residents including housing.' },
        { name: 'Massachusetts Law Reform Institute', phone: '617-357-0700', url: 'https://www.mlri.org/', desc: 'Statewide legal advocacy for low-income tenants and housing policy.' },
        { name: 'MassLegalHelp', phone: null, url: 'https://www.masslegalhelp.org/', desc: 'Self-help legal information on tenant rights, repairs, and eviction in MA.' },
    ],
    'Michigan': [
        { name: 'Michigan Legal Help', phone: null, url: 'https://michiganlegalhelp.org/', desc: 'Self-help legal information and tools for Michigan renters.' },
        { name: 'Legal Aid of Western Michigan', phone: '1-888-783-8190', url: 'https://www.lawestmi.org/', desc: 'Free legal services for western Michigan.' },
        { name: 'Lakeshore Legal Aid', phone: '1-888-783-8190', url: 'https://www.lakeshorelegalaid.org/', desc: 'Free legal help for southeast Michigan including Detroit metro.' },
    ],
    'Minnesota': [
        { name: 'Legal Aid State Support (MN)', phone: '1-888-354-5522', url: 'https://www.lawhelpmn.org/', desc: 'Statewide legal aid directory and info for Minnesota renters.' },
        { name: 'Mid-Minnesota Legal Aid', phone: '612-334-5970', url: 'https://www.mylegalaid.org/', desc: 'Free legal services for the Twin Cities and central MN.' },
        { name: 'HOME Line (MN Tenant Hotline)', phone: '612-728-5767', url: 'https://homelinemn.org/', desc: 'Free tenant hotline — call to talk about repair issues, deposits, or eviction.' },
    ],
    'Mississippi': [
        { name: 'Mississippi Center for Legal Services', phone: '1-800-498-1804', url: 'https://www.mscenterforlegalservices.org/', desc: 'Free legal help for central and southern Mississippi.' },
        { name: 'North Mississippi Rural Legal Services', phone: '1-800-898-8731', url: 'https://www.nmrls.com/', desc: 'Free legal aid for northern Mississippi.' },
    ],
    'Missouri': [
        { name: 'Legal Services of Eastern Missouri', phone: '1-800-444-0514', url: 'https://lsem.org/', desc: 'Free legal help for eastern MO including St. Louis metro.' },
        { name: 'Legal Aid of Western Missouri', phone: '1-800-990-2907', url: 'https://www.lawmo.org/', desc: 'Free legal services for western MO including Kansas City area.' },
    ],
    'Montana': [
        { name: 'Montana Legal Services Association', phone: '1-800-666-6899', url: 'https://www.mtlsa.org/', desc: 'Statewide free legal help including landlord-tenant disputes and habitability.' },
    ],
    'Nebraska': [
        { name: 'Legal Aid of Nebraska', phone: '1-877-250-2016', url: 'https://www.legalaidofnebraska.org/', desc: 'Statewide free legal help for housing, eviction defense, and tenant rights.' },
    ],
    'Nevada': [
        { name: 'Nevada Legal Services', phone: '1-800-323-8666', url: 'https://nevadalegalservices.org/', desc: 'Statewide free legal help for housing and tenant issues.' },
        { name: 'Legal Aid Center of Southern NV', phone: '702-386-1070', url: 'https://www.lacsn.org/', desc: 'Free legal services for Clark County (Las Vegas area) residents.' },
    ],
    'New Hampshire': [
        { name: 'NH Legal Assistance', phone: '1-800-639-5290', url: 'https://www.nhla.org/', desc: 'Statewide free legal services for housing, eviction defense, and tenant rights.' },
        { name: '603 Legal Aid', phone: '1-800-639-5290', url: 'https://www.603legalaid.org/', desc: 'Free legal information and referrals for NH residents.' },
    ],
    'New Jersey': [
        { name: 'Legal Services of New Jersey', phone: '1-888-576-5529', url: 'https://www.lsnj.org/', desc: 'Statewide legal aid hotline — call for housing, eviction, and tenant rights help.' },
        { name: 'Northeast NJ Legal Services', phone: '201-487-2166', url: 'https://www.northeastnjlegalservices.org/', desc: 'Free legal help for Bergen, Hudson, and Passaic counties.' },
    ],
    'New Mexico': [
        { name: 'New Mexico Legal Aid', phone: '1-866-416-1922', url: 'https://www.newmexicolegalaid.org/', desc: 'Statewide free legal services for housing, eviction, and tenant rights.' },
        { name: 'Law Access New Mexico', phone: '1-866-416-1922', url: null, desc: 'Centralized intake line for all NM legal aid — start here.' },
    ],
    'New York': [
        { name: 'Legal Aid Society of NYC', phone: '212-577-3300', url: 'https://www.legalaidnyc.org/', desc: 'Free legal representation for NYC residents facing eviction and housing issues.' },
        { name: 'Legal Services NYC', phone: '917-661-4500', url: 'https://www.legalservicesnyc.org/', desc: 'Free legal help for NYC tenants including repairs, harassment, and eviction.' },
        { name: 'NY Housing Court Help Centers', phone: '646-386-5750', url: 'https://www.nycourts.gov/courts/nyc/housing/', desc: 'Free help navigating housing court — available in all 5 boroughs.' },
        { name: 'Legal Aid Society of Northeastern NY', phone: '1-800-462-2922', url: 'https://www.lasnny.org/', desc: 'Free legal services for upstate NY residents.' },
    ],
    'North Carolina': [
        { name: 'Legal Aid of North Carolina', phone: '1-866-219-5262', url: 'https://www.legalaidnc.org/', desc: 'Statewide free legal help for housing, eviction defense, and habitability.' },
        { name: 'Charlotte Center for Legal Advocacy', phone: '704-376-1600', url: 'https://www.charlottelegaladvocacy.org/', desc: 'Free legal services for Charlotte-Mecklenburg area.' },
    ],
    'North Dakota': [
        { name: 'Legal Services of North Dakota', phone: '1-800-634-5263', url: 'https://www.legalassist.org/', desc: 'Statewide free legal services including landlord-tenant disputes.' },
    ],
    'Ohio': [
        { name: 'Legal Aid Society of Cleveland', phone: '216-687-1900', url: 'https://lasclev.org/', desc: 'Free legal help for greater Cleveland including housing and eviction.' },
        { name: 'Legal Aid Society of Columbus', phone: '614-241-2001', url: 'https://www.columbuslegalaid.org/', desc: 'Free legal services for central Ohio residents.' },
        { name: 'Ohio Legal Help', phone: null, url: 'https://www.ohiolegalhelp.org/', desc: 'Self-help legal information for Ohio renters and tenants.' },
    ],
    'Oklahoma': [
        { name: 'Legal Aid Services of Oklahoma', phone: '1-888-534-5243', url: 'https://www.legalaidok.org/', desc: 'Statewide free legal help for housing, eviction, and tenant rights.' },
    ],
    'Oregon': [
        { name: 'Legal Aid Services of Oregon', phone: '1-800-452-7636', url: 'https://lasoregon.org/', desc: 'Statewide free legal services for housing issues and eviction defense.' },
        { name: 'Oregon Law Center', phone: '503-473-8321', url: 'https://www.oregonlawcenter.org/', desc: 'Legal advocacy for low-income Oregonians on housing policy and tenant rights.' },
        { name: 'Community Alliance of Tenants (OR)', phone: '503-460-9702', url: 'https://www.oregoncat.org/', desc: 'Tenant rights hotline, know-your-rights workshops, and organizing.' },
    ],
    'Pennsylvania': [
        { name: 'Philadelphia Legal Assistance', phone: '215-981-3800', url: 'https://philalegal.org/', desc: 'Free legal services for Philadelphia residents including housing.' },
        { name: 'Legal Aid of Southeastern PA', phone: '610-275-5400', url: 'https://www.lasp.org/', desc: 'Free legal help for suburban Philadelphia counties.' },
        { name: 'Neighborhood Legal Services (Pittsburgh)', phone: '412-255-6700', url: 'https://www.nlsa.us/', desc: 'Free legal help for southwestern Pennsylvania including Pittsburgh.' },
    ],
    'Rhode Island': [
        { name: 'Rhode Island Legal Services', phone: '401-274-2652', url: 'https://www.rils.org/', desc: 'Statewide free legal services for housing and tenant rights.' },
    ],
    'South Carolina': [
        { name: 'SC Legal Services', phone: '1-888-346-5592', url: 'https://www.sclegal.org/', desc: 'Statewide free legal services for housing, eviction, and tenant rights.' },
        { name: 'SC Appleseed Legal Justice Center', phone: '803-779-1113', url: 'https://www.scjustice.org/', desc: 'Legal advocacy for low-income South Carolinians.' },
    ],
    'South Dakota': [
        { name: 'East River Legal Services', phone: '1-800-952-3015', url: 'https://www.erlservices.org/', desc: 'Free legal help for eastern South Dakota.' },
        { name: 'Dakota Plains Legal Services', phone: '1-800-658-2297', url: 'https://www.dpls.org/', desc: 'Free legal services for western South Dakota and tribal areas.' },
    ],
    'Tennessee': [
        { name: 'Legal Aid Society of Middle TN', phone: '1-800-238-1443', url: 'https://www.las.org/', desc: 'Free legal help for middle Tennessee including Nashville area.' },
        { name: 'Memphis Area Legal Services', phone: '901-523-8822', url: 'https://www.malsi.org/', desc: 'Free legal services for the Memphis area.' },
        { name: 'Legal Aid of East Tennessee', phone: '865-637-0484', url: 'https://www.laet.org/', desc: 'Free legal help for eastern Tennessee including Knoxville area.' },
    ],
    'Texas': [
        { name: 'Texas RioGrande Legal Aid', phone: '1-888-988-9996', url: 'https://www.trla.org/', desc: 'Free legal services for southwest Texas, SA, Austin, and the RGV.' },
        { name: 'Lone Star Legal Aid', phone: '1-800-733-8394', url: 'https://www.lonestarlegal.org/', desc: 'Free legal help for east, southeast, and north Texas including Houston.' },
        { name: 'Legal Aid of NorthWest Texas', phone: '1-888-529-5277', url: 'https://www.lanwt.org/', desc: 'Free legal services for the Dallas-Fort Worth area and northwest Texas.' },
        { name: 'Texas Tenant Advisor', phone: null, url: 'https://www.texastenant.org/', desc: 'Self-help information for Texas renters including repair rights and security deposits.' },
    ],
    'Utah': [
        { name: 'Utah Legal Services', phone: '1-800-662-4245', url: 'https://www.utahlegalservices.org/', desc: 'Statewide free legal help for housing, eviction defense, and tenant rights.' },
        { name: 'Legal Aid Society of Salt Lake', phone: '801-328-8849', url: 'https://www.legalaidsocietyofsaltlake.org/', desc: 'Free legal help for Salt Lake County residents.' },
    ],
    'Vermont': [
        { name: 'Legal Services Vermont', phone: '1-800-889-2047', url: 'https://www.vtlegalaid.org/', desc: 'Statewide free legal aid for housing, habitability, and eviction defense.' },
    ],
    'Virginia': [
        { name: 'Legal Aid Justice Center', phone: '1-888-201-2036', url: 'https://www.justice4all.org/', desc: 'Free legal help for central and western Virginia.' },
        { name: 'Legal Services of Northern Virginia', phone: '703-778-6800', url: 'https://www.lsnv.org/', desc: 'Free legal services for NoVA including Fairfax and Arlington.' },
        { name: 'Virginia Legal Aid (statewide)', phone: null, url: 'https://www.valegalaid.org/', desc: 'Self-help legal information for Virginia tenants and renters.' },
    ],
    'Washington': [
        { name: 'Northwest Justice Project', phone: '1-888-201-1014', url: 'https://nwjustice.org/', desc: 'Statewide free legal services for low-income Washingtonians including housing.' },
        { name: 'Tenant Law Center (Seattle)', phone: '206-324-6890', url: 'https://www.tenantlawcenter.org/', desc: 'Free legal help specifically for Seattle-area tenants.' },
        { name: 'WA Tenant Hotline', phone: '206-723-0500', url: null, desc: 'Tenants Union of Washington State — call for advice on repairs, deposits, or eviction.' },
    ],
    'West Virginia': [
        { name: 'Legal Aid of West Virginia', phone: '1-800-642-8279', url: 'https://www.lawv.net/', desc: 'Statewide free legal services for housing, eviction defense, and tenant rights.' },
    ],
    'Wisconsin': [
        { name: 'Legal Action of Wisconsin', phone: '1-888-278-0633', url: 'https://www.legalaction.org/', desc: 'Free legal help for southern Wisconsin including housing and eviction.' },
        { name: 'Legal Aid Society of Milwaukee', phone: '414-727-5300', url: 'https://www.lasmilwaukee.com/', desc: 'Free legal services for Milwaukee County residents.' },
        { name: 'Tenant Resource Center (Madison)', phone: '608-257-0006', url: 'https://www.tenantresourcecenter.org/', desc: 'Tenant rights info, mediation, and assistance for Madison-area renters.' },
    ],
    'Wyoming': [
        { name: 'Legal Aid of Wyoming', phone: '1-877-432-9955', url: 'https://www.lawyoming.org/', desc: 'Statewide free legal help for housing and tenant issues.' },
    ],
};

// Map state codes (e.g. "CT") to full names for lookup
const STATE_CODE_TO_NAME = {};
const stateOpts = getStateOptions();
stateOpts.forEach(s => { STATE_CODE_TO_NAME[s.code] = s.name; });

export default function LegalAidFinder() {
    const navigate = useNavigate();
    const { uiLang } = useLanguage();
    const settings = getSettings();
    const savedStateCode = settings.tenantState || '';
    const savedStateName = STATE_CODE_TO_NAME[savedStateCode] || '';

    const [state, setState] = useState(savedStateName);
    const [searched, setSearched] = useState(!!savedStateName);

    const handleSearch = () => {
        if (!state) return;
        setSearched(true);
    };

    const stateOrgs = STATE_LEGAL_AID[state] || [];

    return (
        <div className="animate-fade-in la-page">
            <h2 className="la-title">{t('legalAidTitle', uiLang)}</h2>
            <p className="la-sub">{t('legalAidSubtitle', uiLang)}</p>

            {/* State search */}
            <div className="la-search glass-panel">
                <div className="la-search-row">
                    <MapPin size={18} color="var(--color-primary)" aria-hidden="true" />
                    <select className="input-field" style={{ flex: 1, appearance: 'auto' }} value={state} onChange={e => { setState(e.target.value); setSearched(!!e.target.value) }} aria-label={t('selectYourState', uiLang)}>
                        <option value="">{t('selectYourState', uiLang)}</option>
                        {Object.keys(STATE_LEGAL_AID).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* State results */}
            {searched && stateOrgs.length > 0 && (
                <div className="la-results animate-fade-in">
                    <h3 className="la-results-title">{t('legalAidIn', uiLang)} {state}</h3>
                    {stateOrgs.map((org, idx) => (
                        <div key={idx} className="org-card glass-panel">
                            <p className="org-name">{org.name}</p>
                            {org.desc && <p className="org-desc">{org.desc}</p>}
                            <div className="org-actions">
                                {org.phone && (
                                    <a href={`tel:${org.phone}`} className="org-btn org-btn-call">
                                        <Phone size={16} /> {t('call', uiLang)} {org.phone}
                                    </a>
                                )}
                                {org.url && (
                                    <a href={org.url} target="_blank" rel="noopener noreferrer" className="org-btn org-btn-web">
                                        <ExternalLink size={16} /> {t('visitWebsite', uiLang)}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {searched && stateOrgs.length === 0 && (
                <div className="la-empty glass-panel">
                    <p>{t('noLegalAidListed', uiLang).replace('{state}', state)}</p>
                </div>
            )}

            {/* National resources */}
            <div className="la-national">
                <h3 className="la-national-title">{t('nationalResources', uiLang)}</h3>
                <p className="la-national-sub">{t('nationalResourcesSub', uiLang)}</p>
                {NATIONAL_RESOURCES.map((org, idx) => (
                    <div key={idx} className="org-card glass-panel">
                        <p className="org-name">{org.name}</p>
                        <p className="org-desc">{org.desc}</p>
                        <div className="org-actions">
                            {org.phone && (
                                <a href={`tel:${org.phone}`} className="org-btn org-btn-call">
                                    <Phone size={16} /> {t('call', uiLang)} {org.phone}
                                </a>
                            )}
                            {org.url && (
                                <a href={org.url} target="_blank" rel="noopener noreferrer" className="org-btn org-btn-web">
                                    <ExternalLink size={16} /> {t('visitWebsite', uiLang)}
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="la-disc">
                <AlertTriangle size={14} aria-hidden="true" />
                <span>{t('legalAidEmergencyWarning', uiLang)}</span>
            </div>

            <style>{`
        .la-page{padding-bottom:2rem}
        .la-title{font-size:1.5rem;margin-bottom:0.15rem}
        .la-sub{color:var(--color-text-light-muted);font-size:0.9rem;margin-bottom:1.25rem;line-height:1.4}
        .la-search{padding:0.85rem 1rem;margin-bottom:1.25rem}
        .la-search-row{display:flex;align-items:center;gap:0.5rem}
        .la-go{padding:0.75rem;flex-shrink:0}
        .la-results{margin-bottom:1.5rem}
        .la-results-title{font-size:1.1rem;margin-bottom:0.75rem;color:var(--color-primary)}
        .org-card{padding:1rem 1.15rem;margin-bottom:0.6rem}
        .org-name{font-weight:700;font-size:1rem;margin-bottom:0.25rem}
        .org-desc{font-size:0.82rem;color:var(--color-text-light-muted);line-height:1.45;margin-bottom:0.65rem}
        .org-actions{display:flex;flex-wrap:wrap;gap:0.5rem}
        .org-btn{display:inline-flex;align-items:center;gap:0.35rem;padding:0.55rem 0.9rem;border-radius:var(--radius-md);font-size:0.82rem;font-weight:600;text-decoration:none;transition:all var(--transition-fast)}
        .org-btn:active{transform:scale(0.97)}
        .org-btn-call{background:linear-gradient(135deg,#10b981,#059669);color:white}
        .org-btn-web{background:var(--color-surface-light);border:1px solid var(--color-border);color:var(--color-primary)}
        .la-empty{padding:1.25rem;margin-bottom:1.25rem;font-size:0.88rem;color:var(--color-text-light-muted);line-height:1.5}
        .la-national{margin-bottom:1rem}
        .la-national-title{font-size:1.1rem;margin-bottom:0.15rem}
        .la-national-sub{font-size:0.82rem;color:var(--color-text-light-muted);margin-bottom:0.75rem}
        .la-disc{display:flex;align-items:flex-start;gap:0.5rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:var(--radius-md);font-size:0.78rem;color:var(--color-text-light-muted);line-height:1.45}
        .la-disc svg{flex-shrink:0;color:#ef4444;margin-top:1px}
      `}</style>
        </div>
    );
}
