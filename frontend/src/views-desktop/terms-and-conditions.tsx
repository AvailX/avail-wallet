import * as React from 'react';
import * as mui from '@mui/material';
import {ArrowBack} from '@mui/icons-material';
import {BodyText, Title2Text, SubtitleText} from '../components/typography/typography';
import Layout from './reusable/layout';

// Typography

function TermsAndConditions() {
	return (
		<Layout>
			<mui.Button
				variant='contained'
				onClick={() => {
					window.history.back();
				}}
				sx={{
					width: '10%', bgcolor: 'transparent', boxShadow: 'none', mt: '3%', ml: '2%', '&:hover': {
						backgroundColor: '#00FFAA',
						boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
						transform: 'scale(1.03)',
					},
					'&:focus': {
						backgroundColor: '#00FFAA',
						boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
					},
				}}
			>
				<ArrowBack sx={{width: '30px', height: '30px', color: '#fff'}} />
			</mui.Button>
			<Title2Text sx={{color: '#00FFAA', alignSelf: 'center', mt: '5%'}}>Terms of Service</Title2Text>
			<mui.Box sx={{
				display: 'flex', flexDirection: 'column', p: 7, color: '#fff',
			}}>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>OVERVIEW</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
                This application is operated by Avail Limited. Throughout the application, the terms “Avail”, “we”, “us” and “our” refer to Avail Limited. Avail Limited offers this application, including all information, tools and services available from this application to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            Avail is an application which allows for the creation of wallets on the Aleo Blockchain. Through these wallets users can hold, purchase or sell digital (blockchain assets).
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            By using our application, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the application, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE ACCESSING OR USING OUR APPLICATION. BY ACCESSING OR USING ANY PART OF THE APPLICATION, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO ALL THE TERMS AND CONDITIONS OF THIS AGREEMENT, THEN YOU MAY NOT ACCESS THE APPLICATION OR USE ANY SERVICES. IF THESE TERMS OF SERVICE ARE CONSIDERED AN OFFER, ACCEPTANCE IS EXPRESSLY LIMITED TO THESE TERMS OF SERVICE.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            By accessing Our application, you accept and acknowledge:
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            • The prices of blockchain assets are extremely volatile and we cannot guarantee purchasers will not lose money. Blockchain assets available to trade on Avail should not be viewed as investments: their prices are determined by the market and fluctuate considerably.
				</BodyText>
				<BodyText sx={{mt: '1%'}}>
            • You are solely responsible for determining any taxes that apply to your transactions. Avail’s services are non-custodial, such that we do not at any time have custody of the blockchain assets owned by our users. We do not store, send, or receive blockchain assets, as they respectively exist on the blockchain. As such, and due to the nature of the services provided, you are fully responsible for protecting your wallets and assets from any and all potential risks.
				</BodyText>
				<BodyText sx={{mt: '1%'}}>
            • We are not responsible for any assets that users may mistakenly or willingly access or purchase through the application. You accept responsibility for any risks associated with purchasing such user-generated content, including (but not limited to) the risk of purchasing counterfeit assets, mislabeled assets, assets that are vulnerable to metadata decay, assets on faulty smart contracts, and assets that may become untransferable
				</BodyText>
				<BodyText sx={{mt: '1%'}}>
            • Any new features or tools which are added to the current application shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page https://avail.global/terms-and-conditions. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.
				</BodyText>
				<BodyText sx={{mt: '1%'}}>
            • Your continued use of or access to the application following the posting of any changes constitutes acceptance of those changes.
				</BodyText>
				<BodyText sx={{mt: '1%'}}>
            • You represent to us that you and your financial institutions, or any party that controls you or your financials institutions, are (1) not subject to sanctions or otherwise designated on any list of prohibited restricted parties, by the European Union or its Member States, or other applicable government authority, and (2) not located in any country subject to a comprehensive sanctions program implemented by the European Union.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            For the purposes of these Terms, the capitalised phrases in quotes defined in this clause will have the definitions given to them below. In these Terms, unless the context otherwise requires:
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            For the purposes of these Terms, the capitalised phrases in quotes defined in this clause will have the definitions given to them below. In these Terms, unless the context otherwise requires:
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            “Blockchain” means a technological framework, making use of distributed technology or other structured record, which is verifiable, immutable, and publicly accessible
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            “NFT” means a non-fungible token of any standard, or other similar digital token implemented on a distributed ledger technology which is authenticatable (through cryptographic means or otherwise), and use smart contracts to generate, authenticate, transfer, and validate data
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            “Wallet” means a digital wallet capable of storing and transacting in NFTs, cryptocurrencies and other digital assets.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 1 - APPLICATION TERMS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this application.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You may not use our products for any illegal or unauthorised purpose nor may you, in the use of the application, violate any laws in your jurisdiction (including but not limited to copyright laws).
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You must not transmit any worms or viruses, malware any other code of a destructive or malicious nature
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            A breach or violation of any of the Terms will result in an immediate termination of your Services.
				</BodyText>
				<SubtitleText sx={{mt: '2%'}}>SECTION 2 - GENERAL CONDITIONS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            We reserve the right to refuse Service to anyone for any reason at any time.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You understand that your content may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website or application through which the Service is provided, without express written permission by us.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            In order to access the Services offered by Avail, You will need access to network, internet, and hardware requirements as may be necessary to access the Services provided.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            By using your Wallet in connection with the Services, You agree that We accept no responsibility for, or liability to, in connection with your use of a Wallet. We make no representation or warranties regarding how the Services will operate with any other Wallet not provided by Us. You are solely responsible for keeping your Wallet secure, and We are not liable for any acts or omissions by You which lead to the Wallet being compromised.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You are solely responsible for properly configuring and using the Services and otherwise taking appropriate action to secure, protect, and backup your accounts in a manner that will provide appropriate security and protection, which might include use of encryption. If you are not able to be responsible for your own account security, or do not want such an obligation, then you should not use the Services. Your obligations under these Terms include ensuring any available software updates or upgrades to a Service you are using are promptly installed or implemented, and recording and securely maintaining any passwords or secret recovery phrases that relate to your use of the Services. You acknowledge that certain methods of securing your recovery method, such as storing it as a digital file on your personal device or on a cloud storage provider, may increase the risk that your account or recovery method will be compromised. You further acknowledge that you will not share with us nor any other third party any password or secret recovery phrase that relates to your use of the Services, and that we will not be held responsible if you do share any such password or phrase, whether you do so knowingly or unknowingly. For the avoidance of doubt, we take no responsibility whatsoever for any theft of a secret recovery method that involved intrusion into a cloud provider’s data repository.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
     You must provide any and all equipment, connectivity, and software necessary to access the Services. You are solely responsible for any fees which you incur in this regard when accessing the Services, which also contain the “gas fees” necessary for any transaction to go through
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            We are not responsible if information made available on this application is not accurate, complete or current. The material on this application is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this application is at your own risk.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            This application may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this application at any time, but we have no obligation to update any information on our application. You agree that it is your responsibility to monitor changes to our application.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            Prices for our products are subject to change without notice.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 5 - PRODUCTS OR SERVICES</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            We have made every effort to display as accurately as possible. We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice, at Our sole discretion. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this application is void where prohibited.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We do not warrant that the quality of any products, services, information, or other services purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account. We reserve the right to limit or prohibit orders that, in our sole judgement, appear to be placed by malicious actors. You agree to provide current, complete and accurate purchase and account information for all purchases made at our application. You agree to promptly update your account and other information, so that we can complete your transactions and contact you as needed.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 7 - OPTIONAL TOOLS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            We may provide you with access to third-party tools over which we neither monitor nor have any control nor input.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You acknowledge and agree that we provide access to such tools ”as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            Any use by you of optional tools offered through the application is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We may also, in the future, offer new services and/or features through the application (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 8 - THIRD-PARTY LINKS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            Certain content, products and services available via our Service may include materials from third-parties
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            Third-party links on this application may direct you to third-party websites or services that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or for any other materials, products, or services of third-parties.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third-party.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, “comments”), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation (1) to maintain any comments in confidence; (2) to pay compensation for any comments; or (3) to respond to any comments. We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion are unlawful, offensive, threatening, libellous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service. You agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your comments will not contain libellous or otherwise unlawful, abusive or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website. You may not use a false e-mail address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third-party.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 10 - PERSONAL INFORMATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            Your submission of personal information through the store is governed by our Privacy Policy. To view our Privacy Policy https://avail.global/privacy-policy.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            Occasionally there may be information on our application or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website, should be taken to indicate that all information in the Service or on any related website has been modified or updated.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 12 - PROHIBITED USES</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the application or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, harm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY; RISK</SubtitleText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            Your access to the Services may be interrupted from time to time for any reason, including but not limited to the malfunction of equipment, maintenance, or repair of the Services or other actions that Avail, in Our sole and absolute discretion, may take. You acknowledge that the use of the internet and all access to, and use of the Services is at your own risk.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you. You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided as is and  as available for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement. In no case shall Avail Limited, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            To the fullest extent permissible by the applicable law, Avail Limited and any of its subsidiaries, affiliates, and licensors, and their respective employees, agents and contractors make no express warranties and hereby disclaim all implied warranties (including, without limitation, regarding any NFTs, smart contract, etc.), including the implied warranties of merchantability, fitness for a particular purpose, non-infringement, correctness, accuracy, or reliability. Nor does Avail provide any warranties over any third-party services such as Wallets, or marketplaces which you may use to access the Services
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You accept the inherent security risks of providing information and dealing online over the internet. Avail will not be responsible or liable to You for any losses You incur as the result of your use of any Blockchain network or any digital and/or electronic wallet, including but not limited to any losses, damages or claims arising from: user error, such as forgotten passwords or incorrect smart contracts or other transactions; server failure or data loss; corrupted wallet files; or unauthorised access or activities by third parties, including but not limited to the use of viruses, phishing, brute forcing or other means of attack. Blockchain assets are intangible digital assets that exist only by virtue of the ownership record maintained on the Blockchain. All smart contracts are conducted and occur on the decentralised ledgers within the blockchain, which is early stage and/or experimental technology. Avail Limited makes no guarantees or promises with respect to smart contracts. Avail Limited  is not responsible for losses due to blockchains or any features of or related to them or any electronic and/or digital wallet.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            You agree that Avail Limited’s total, aggregate liability to you for any and all claims arising out of or relating to these Terms and/or any NFT, is limited to the amounts You actually paid Avail Limited under these Terms in the twelve (12) month period preceding the date the claim arose. Avail Limited entered into these Terms in reliance upon the warranty disclaimers and limitations of liability set forth herein, which reflect a reasonable and fair allocation of risk and form an essential basis of the bargain. Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, and some jurisdictions also limit disclaimers or limitations of liability for personal injury from consumer products, so the above limitations may not apply to personal injury claims.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            THE SERVICES ARE PROVIDED “AS IS.” EXCEPT TO THE EXTENT PROHIBITED BY LAW, OR TO THE EXTENT ANY STATUTORY RIGHTS APPLY THAT CANNOT BE EXCLUDED, LIMITED OR WAIVED, WE AND OUR AFFILIATES AND LICENSORS (A) MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE REGARDING THE SERVICES,, THE THIRD PARTY CONTENT, OR THE THIRD PARTY SERVICES, AND (B) DISCLAIM ALL WARRANTIES, INCLUDING ANY IMPLIED OR EXPRESS WARRANTIES (I) OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR QUIET ENJOYMENT, (II) ARISING OUT OF ANY COURSE OF DEALING OR USAGE OF TRADE, (III) THAT THE SERVICES, THIRD PARTY CONTENT, OR THIRD PARTY SERVICE WILL BE UNINTERRUPTED, ERROR FREE OR FREE OF HARMFUL COMPONENTS, AND (IV) THAT ANY CONTENT WILL BE SECURE OR NOT OTHERWISE LOST OR ALTERED. YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NOT RELIED AND ARE NOT RELYING UPON ANY REPRESENTATION OR WARRANTY FROM AVAIL THAT IS NOT OTHERWISE IN THIS AGREEMENT OR IN A SEPARATE WRITTEN AGREEMENT BETWEEN US, AND YOU AGREE YOU WILL NOT TAKE A POSITION IN ANY PROCEEDING THAT IS INCONSISTENT WITH THIS PROVISION.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            OUR SERVICES RELY ON EMERGING TECHNOLOGIES, SUCH AS ALEO. SOME SERVICES ARE SUBJECT TO INCREASED RISK THROUGH YOUR POTENTIAL MISUSE OF THINGS SUCH AS PUBLIC/PRIVATE KEY CRYPTOGRAPHY, OR FAILING TO PROPERLY UPDATE OR RUN SOFTWARE TO ACCOMMODATE PROTOCOL UPGRADES, LIKE A CHANGE IN THE CONSENSUS MECHANISM. BY USING THE SERVICES YOU EXPLICITLY ACKNOWLEDGE AND ACCEPT THESE HEIGHTENED RISKS. YOU REPRESENT THAT YOU ARE FINANCIALLY AND TECHNICALLY SOPHISTICATED ENOUGH TO UNDERSTAND THE INHERENT RISKS ASSOCIATED WITH USING CRYPTOGRAPHIC AND BLOCKCHAIN-BASED SYSTEMS AND UPGRADING YOUR SOFTWARE AND PROCESSES TO ACCOMMODATE OFFERING AND PROTOCOL UPGRADES, AND THAT YOU HAVE A WORKING KNOWLEDGE OF THE USAGE AND INTRICACIES OF DIGITAL ASSETS AND DIGITAL TOKENS. IN PARTICULAR, YOU UNDERSTAND THAT WE DO NOT OPERATE THE ALEO BLOCKCHAIN PROTOCOL OR ANY OTHER BLOCKCHAIN PROTOCOL, COMMUNICATE OR EXECUTE PROTOCOL UPGRADES, OR APPROVE OR PROCESS BLOCKCHAIN TRANSACTIONS ON BEHALF OF YOU. YOU FURTHER UNDERSTAND THAT BLOCKCHAIN PROTOCOLS PRESENT THEIR OWN RISKS OF USE, THAT SUPPORTING OR PARTICIPATING IN THE PROTOCOL MAY RESULT IN LOSSES IF YOUR PARTICIPATION VIOLATES CERTAIN PROTOCOL RULES, THAT BLOCKCHAIN-BASED TRANSACTIONS ARE IRREVERSIBLE, THAT YOUR PRIVATE KEY AND RECOVERY METHOD MUST BE KEPT SECRET AT ALL TIMES, THAT UNLESS OTHERWISE STATED AVAIL WILL NOT STORE A BACKUP OF, NOR WILL BE ABLE TO DISCOVER OR RECOVER, YOUR PRIVATE KEY OR RECOVERY METHOD, THAT DIGITALLY COPYING AND STORING YOUR RECOVERY METHOD ON A CLOUD STORAGE SYSTEM OR OTHER THIRD PARTY SUPPORTED DATA STORAGE, INCLUDING YOUR PERSONAL DEVICE, MAY INCREASE THE RISK OF LOSS OR THEFT, AND THAT YOU ARE SOLELY RESPONSIBLE FOR ANY APPROVALS OR PERMISSIONS YOU PROVIDE BY CRYPTOGRAPHICALLY SIGNING BLOCKCHAIN MESSAGES OR TRANSACTIONS, ESPECIALLY THOSE RESPONDING TO SOLICITATIONS AND OTHER PROMPTS FROM THIRD PARTIES.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            YOU FURTHER UNDERSTAND AND ACCEPT THAT DIGITAL TOKENS PRESENT MARKET VOLATILITY RISK, TECHNICAL SOFTWARE RISKS, REGULATORY RISKS, AND CYBERSECURITY RISKS. YOU UNDERSTAND THAT THE COST AND SPEED OF A BLOCKCHAIN-BASED SYSTEM IS VARIABLE, THAT COST MAY INCREASE DRAMATICALLY AT ANY TIME, AND THAT COST AND SPEED IS NOT WITHIN THE CAPABILITY OF AVAIL TO CONTROL. YOU UNDERSTAND THAT PROTOCOL UPGRADES MAY INADVERTENTLY CONTAIN BUGS OR SECURITY VULNERABILITIES THAT MAY RESULT IN LOSS OF FUNCTIONALITY AND ULTIMATELY FUNDS.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            YOU UNDERSTAND AND ACCEPT THAT AVAIL DOES NOT CONTROL ANY BLOCKCHAIN PROTOCOL, NOR DOES AVAIL CONTROL ANY SMART CONTRACT THAT IS NOT OTHERWISE OFFERED BY AVAIL AS PART OF THE SERVICES AND IS NOT ITSELF A THIRD PARTY SERVICE. YOU UNDERSTAND AND ACCEPT THAT AVAIL DOES NOT CONTROL AND IS NOT RESPONSIBLE FOR THE TRANSITION OF ANY BLOCKCHAIN PROTOCOL FROM PROOF OF WORK TO PROOF OF STAKE CONSENSUS OR THE FUNCTIONING OF ANY PROTOCOL AFTER IT UNDERGOES A TECHNICAL UPGRADE. YOU UNDERSTAND AND ACCEPT THAT AVAIL DOES NOT CONTROL AND IS NOT RESPONSIBLE FOR ANY THIRD PARTY SERVICE. YOU AGREE THAT YOU ALONE, AND NOT AVAIL, IS RESPONSIBLE FOR ANY TRANSACTIONS THAT YOU ENGAGE IN WITH REGARD TO SUPPORTING ANY BLOCKCHAIN PROTOCOL WHETHER THROUGH TRANSACTION VALIDATION OR OTHERWISE, OR ANY TRANSACTIONS THAT YOU ENGAGE IN WITH ANY THIRD-PARTY-DEVELOPED SMART CONTRACT OR TOKEN, INCLUDING TOKENS THAT WERE CREATED BY A THIRD PARTY FOR THE PURPOSE OF FRAUDULENTLY MISREPRESENTING AFFILIATION WITH ANY BLOCKCHAIN PROJECT. YOU AGREE THAT AVAIL IS NOT RESPONSIBLE FOR THE REGULATORY STATUS OR TREATMENT IN ANY JURISDICTION OF ANY DIGITAL ASSETS THAT YOU MAY ACCESS OR TRANSACT WITH USING AVAIL SERVICES. YOU EXPRESSLY ASSUME FULL RESPONSIBILITY FOR ALL OF THE RISKS OF ACCESSING AND USING THE SERVICES TO INTERACT WITH BLOCKCHAIN PROTOCOLS.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 14 - INDEMNIFICATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            You agree to indemnify, defend and hold Avail Limited and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 15 - SEVERABILITY</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 16 - TERMINATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our application. If in our sole judgement you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof).
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 17 - ENTIRE AGREEMENT</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            These Terms of Service and any policies or operating rules posted by us on this application or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service). Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>

				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 18 - GOVERNING LAW</SubtitleText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            These Terms, and any action related will be governed and interpreted by the Laws of Malta, and shall, in the case of any legal action, be subject to the exclusive jurisdiction of Malta, and You waive any objection to this jurisdiction and venue.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            You and Avail Limited agree that any and all disputes arising out of or in connection with these Terms, or the use of Our Services will be resolved exclusively by means of individual arbitration. You and Avail Limited agree that such disputes will be governed by the Malta Arbitration Act (Chapter 387 of the Laws of Malta), and shall be referred to the Malta Arbitration Centre and its arbitral tribunals. You and the Avail Limited are waiving your right to normal recourse to the Courts of Law, except for Avail Limited’s ability to seek normal recourse to the Courts of Law in the case of Intellectual Property infringement. This Clause shall survive the termination of these terms.
				</BodyText>
				<BodyText sx={{mt: '2%', fontWeight: 'bold'}}>
            You and Avail Limited agree that any claims brought against each other will be brought in their own individual capacity, and not as a member of a class of claimants in any legal action.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SECTION 19 - CHANGES TO TERMS OF SERVICE</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
            You can review the most current version of the Terms of Service at any time at this page.
				</BodyText>
				<BodyText sx={{mt: '2%'}}>
            We reserve the right to revise and update these Terms from time to time at Our own discretion. All changes are effective from the moment that they are communicated to the public, by means of posting on Our website, and other communication portals. You are expected to review these terms from time to time, as continued use of Our Services makes any revision binding on You.
				</BodyText>
				<SubtitleText sx={{mt: '2%', fontWeight: 'bold'}}>SSECTION 20 - CONTACT INFORMATION</SubtitleText>
				<BodyText sx={{mt: '2%'}}>
                Questions about the Terms of Service should be sent to us at info@avail.global.
				</BodyText>

				<BodyText sx={{mt: '2%'}}>
             1 February 2024
				</BodyText>
			</mui.Box>
		</Layout>
	);
}

export default TermsAndConditions;
