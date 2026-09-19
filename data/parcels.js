"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawParcelsChandigarh = exports.rawParcelsTamilNadu = exports.dummyLandParcels = void 0;
/**
 * Dummy land parcels located around Lucknow, Uttar Pradesh, India
 * Reference Coordinates: ~26.8° N, 80.9° E
 * Note: In GeoJSON, coordinates follow [longitude, latitude] ordering.
 */
exports.dummyLandParcels = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            id: "PARCEL-001",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.9412, 26.8451],
                        [80.9438, 26.8455],
                        [80.9434, 26.8431],
                        [80.9408, 26.8427],
                        [80.9412, 26.8451],
                    ],
                ],
            },
            properties: {
                ulpin: "UP26A8941B",
                khasraNo: "Khasra No. 245/2",
                ownerName: "Rameshwar Prasad Sharma",
                landUse: "Agricultural",
                buildingPermission: "Residential - Approved", // Conflict-flagged parcel: Zoned Agricultural vs Residential building permit
                rorStatus: "Verified",
                clearOrDisputed: "Clear",
                encumbrances: "Nil (Encumbrance Certificate Clean - Sub-Registrar Lucknow Sadar)",
                taxStatus: "Paid",
                utilityLines: [
                    "State Tube-well Power Connection (11kV)",
                    "Canal Irrigation Sub-Branch Line",
                    "BSNL BharatNet Optical Fiber Along Highway",
                ],
                areaInHectares: 1.45,
                marketValueInINR: 4200000,
                chainOfTitle: [
                    { date: "12 Oct 2021", ownerName: "Rameshwar Prasad Sharma", transactionType: "Inheritance", documentRef: "WLL/2021/8812" },
                    { date: "18 Mar 2008", ownerName: "Late Ram Avtar Sharma", transactionType: "Mutation", documentRef: "MUT/2008/412" },
                    { date: "04 Aug 1989", ownerName: "Bhairon Singh Yadav", transactionType: "Sale", documentRef: "DEED/1989/1049" },
                ],
            },
        },
        {
            type: "Feature",
            id: "PARCEL-002",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.9445, 26.8458],
                        [80.9472, 26.8461],
                        [80.9468, 26.8438],
                        [80.9441, 26.8435],
                        [80.9445, 26.8458],
                    ],
                ],
            },
            properties: {
                ulpin: "UP09K2452M",
                khasraNo: "Khasra No. 102/1-Ka",
                ownerName: "Sunita Devi Verma",
                landUse: "Residential",
                rorStatus: "Digitally Signed",
                clearOrDisputed: "Clear",
                encumbrances: "State Bank of India Home Loan charge registered (₹28.5 Lakhs)",
                taxStatus: "Paid",
                utilityLines: [
                    "Municipal Potable Water Supply Pipeline",
                    "Underground Sewage Trunk Network",
                    "UPPCL Domestic 230V Smart Meter Grid",
                    "Green Gas PNG Domestic Pipeline",
                ],
                areaInHectares: 0.82,
                marketValueInINR: 6800000,
                ownerConsentRequired: true, // Consent-required parcel: DPDP Act protection for Officer view
                chainOfTitle: [
                    { date: "15 Jan 2023", ownerName: "Sunita Devi Verma", transactionType: "Sale", documentRef: "REG/2023/5194" },
                    { date: "11 Nov 2014", ownerName: "Devendra Swaroop Verma", transactionType: "Mutation", documentRef: "MUT/2014/902" },
                    { date: "24 Jun 1999", ownerName: "Awadh Urban Housing Promoters Ltd", transactionType: "Allotment", documentRef: "SALE/1999/3401" },
                ],
            },
        },
        {
            type: "Feature",
            id: "PARCEL-003",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.9415, 26.8421],
                        [80.9442, 26.8424],
                        [80.9439, 26.8398],
                        [80.9411, 26.8395],
                        [80.9415, 26.8421],
                    ],
                ],
            },
            properties: {
                ulpin: "UP80B3184X",
                khasraNo: "Khasra No. 318/4-Min",
                ownerName: "Mohammad Tariq Ansari",
                landUse: "Commercial",
                rorStatus: "Pending Mutation",
                clearOrDisputed: "Under Scrutiny",
                encumbrances: "Punjab National Bank Commercial Hypothecation (₹55 Lakhs)",
                taxStatus: "Pending",
                utilityLines: [
                    "High Tension Commercial 33kV Dedicated Feeder",
                    "Industrial Stormwater Drainage Trench",
                    "5G Telecom Mobile Tower Rooftop Lease",
                ],
                areaInHectares: 1.15,
                marketValueInINR: 9500000,
                chainOfTitle: [
                    { date: "02 Feb 2024", ownerName: "Mohammad Tariq Ansari", transactionType: "Mutation", documentRef: "MUT/2024/772" },
                    { date: "19 May 2016", ownerName: "Late Abdul Qadir Ansari", transactionType: "Inheritance", documentRef: "DEED/2016/184" },
                    { date: "08 Sep 2002", ownerName: "Gomti Commercial Holdings Pvt Ltd", transactionType: "Sale", documentRef: "SALE/2002/990" },
                ],
            },
        },
        {
            type: "Feature",
            id: "PARCEL-004",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.9449, 26.8428],
                        [80.9478, 26.8431],
                        [80.9474, 26.8404],
                        [80.9446, 26.8401],
                        [80.9449, 26.8428],
                    ],
                ],
            },
            properties: {
                ulpin: "UP14C5123Z",
                khasraNo: "Khasra No. 512/3",
                ownerName: "Dr. Vikramaditya Rathore (Saraswati Vidya Trust)",
                landUse: "Institutional", // Institutional landUse
                rorStatus: "Under Review",
                clearOrDisputed: "Under Scrutiny",
                encumbrances: "State Higher Education Council Registered Trust Grant Deed",
                taxStatus: "Overdue", // Tax-defaulter parcel: Municipal institutional cess overdue
                utilityLines: [
                    "Institutional High-Capacity Water Trunk Line",
                    "Dedicated Solar Substation Grid (50kW)",
                    "Dual-Path High-Speed Optical Fiber Ring",
                    "Dedicated Emergency Access Corridor",
                ],
                areaInHectares: 2.3,
                marketValueInINR: 14200000,
                chainOfTitle: [
                    { date: "14 Jul 2022", ownerName: "Dr. Vikramaditya Rathore (Trustee)", transactionType: "Allotment", documentRef: "REG/2022/6621" },
                    { date: "29 Apr 2011", ownerName: "Rathore Educational Foundation", transactionType: "Mutation", documentRef: "MUT/2011/305" },
                    { date: "16 Nov 1995", ownerName: "UP State Institutional Land Allotment Board", transactionType: "Grant", documentRef: "IND/1995/102" },
                ],
            },
        },
        {
            type: "Feature",
            id: "PARCEL-005",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.9485, 26.8452],
                        [80.9515, 26.8456],
                        [80.9511, 26.8427],
                        [80.9481, 26.8423],
                        [80.9485, 26.8452],
                    ],
                ],
            },
            properties: {
                ulpin: "UP28D1891R",
                khasraNo: "Khasra No. 88/3",
                ownerName: "Chaudhary Mahendra Pal Yadav & Bros",
                landUse: "Agricultural",
                rorStatus: "Disputed", // Disputed parcel: Civil court title injunction
                clearOrDisputed: "Disputed",
                encumbrances: "Civil Court Injunction Order #OS-412/2024 (Title Boundary Dispute Sub Judice)",
                taxStatus: "Overdue", // Also tax-defaulter: Agricultural water cess arrears
                utilityLines: [
                    "Overhead High-Voltage Feeder Line (Contested Easement)",
                    "Village Boundary Canal Drainage Culvert",
                ],
                areaInHectares: 1.78,
                marketValueInINR: 8100000,
                chainOfTitle: [
                    { date: "05 Jun 2020", ownerName: "Chaudhary Mahendra Pal Yadav", transactionType: "Inheritance", documentRef: "COURT/2020/412" },
                    { date: "12 Dec 2005", ownerName: "Late Sukhram Singh Yadav", transactionType: "Partition", documentRef: "PART/2005/760" },
                    { date: "22 Aug 1982", ownerName: "Jagannath Prasad Yadav", transactionType: "Sale", documentRef: "DEED/1982/112" },
                ],
            },
        },
    ],
};
exports.default = exports.dummyLandParcels;
/**
 * Raw Tamil Nadu Cadastral Dataset (Tamil Nadu Revenue Dept e-Services / Anyha format)
 * Uses native Tamil Nadu terminology: patta_no, pattadar_name, survey_subdivision, classification, ec_status
 * Coordinates: Chennai / Sriperumbudur belt (~13.00° N, 80.05° E)
 */
exports.rawParcelsTamilNadu = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            id: "TN-PARCEL-101",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.0512, 13.0051],
                        [80.0542, 13.0058],
                        [80.0538, 13.0028],
                        [80.0508, 13.0021],
                        [80.0512, 13.0051],
                    ],
                ],
            },
            properties: {
                patta_no: "TN04M4910A", // 10-digit alphanumeric ULPIN
                pattadar_name: "K. Senthil Murugan & M. Meenakshi",
                survey_subdivision: "Khasra No. 142/3A1",
                classification: "Nanjai (Wet Agricultural Wetland)",
                ec_status: "Nil Encumbrance Certificate (Sub-Registrar Guindy Doc #2023/1842)",
                dispute_status: "Clear Patta - Digitally Signed",
                extent_hectares: 1.25,
                guideline_val_inr: 4800000,
                tax_paid_status: "Paid (e-Challan #TN2024-81920)",
                utility_feeders: [
                    "TANGEDCO 3-Phase Agricultural Feeder",
                    "Palar River Irrigation Channel Link",
                    "BSNL BharatNet OFC Cable",
                ],
                buildingPermission: "Residential - Approved", // Conflict-flagged in TN
                chainOfTitle: [
                    { date: "14 Nov 2022", ownerName: "K. Senthil Murugan & M. Meenakshi", transactionType: "Sale", documentRef: "TN-REG/2022/9920" },
                    { date: "03 Aug 2010", ownerName: "M. Krishnaswamy Chettiar", transactionType: "Inheritance", documentRef: "PATTA/2010/440" },
                    { date: "19 Jan 1991", ownerName: "Sriperumbudur Agro Holdings", transactionType: "Sale", documentRef: "DOC/1991/1190" },
                ],
            },
        },
        {
            type: "Feature",
            id: "TN-PARCEL-102",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.0548, 13.0062],
                        [80.0578, 13.0065],
                        [80.0572, 13.0035],
                        [80.0544, 13.0032],
                        [80.0548, 13.0062],
                    ],
                ],
            },
            properties: {
                patta_no: "TN05R1423B", // 10-digit alphanumeric ULPIN
                pattadar_name: "R. Vijayalakshmi & S. Swaminathan",
                survey_subdivision: "Khasra No. 145/2B",
                classification: "Natham Manai (Approved Residential Layout)",
                ec_status: "Indian Bank Home Loan Mortgage registered (₹32 Lakhs)",
                dispute_status: "Clear Patta - Revenue Approved",
                extent_hectares: 0.65,
                guideline_val_inr: 6200000,
                tax_paid_status: "Paid (e-Challan #TN2024-99124)",
                utility_feeders: [
                    "CMWSSB Water Mains",
                    "TNEB Domestic 230V Line",
                    "Municipal Stormwater Drainage Canal",
                ],
                ownerConsentRequired: true, // Consent-required in TN
                chainOfTitle: [
                    { date: "18 Jun 2023", ownerName: "R. Vijayalakshmi", transactionType: "Sale", documentRef: "TN-REG/2023/1841" },
                    { date: "25 Sep 2015", ownerName: "K. Ramanathan", transactionType: "Mutation", documentRef: "MUT/2015/612" },
                    { date: "10 Mar 2004", ownerName: "Chennai Suburban Layouts Pvt Ltd", transactionType: "Sale", documentRef: "SUB/2004/782" },
                ],
            },
        },
        {
            type: "Feature",
            id: "TN-PARCEL-103",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [80.0515, 13.0018],
                        [80.0545, 13.0022],
                        [80.0541, 12.9992],
                        [80.0511, 12.9988],
                        [80.0515, 13.0018],
                    ],
                ],
            },
            properties: {
                patta_no: "TN06D1481C", // 10-digit alphanumeric ULPIN
                pattadar_name: "A. Dharmalingam Pillai",
                survey_subdivision: "Khasra No. 148/1C",
                classification: "Institutional & Community Health Center", // Institutional in TN
                ec_status: "Civil Court Stay Order OS #312/2024 attached",
                dispute_status: "Disputed - Boundary Title Litigation Pending", // Disputed in TN
                extent_hectares: 1.8,
                guideline_val_inr: 7500000,
                tax_paid_status: "Overdue Arrears (Notice #914/2025)", // Tax defaulter in TN
                utility_feeders: [
                    "High Tension 33kV Line Corridor",
                    "Deep Tube-well Irrigation Pipeline",
                ],
                chainOfTitle: [
                    { date: "11 Dec 2021", ownerName: "A. Dharmalingam Pillai", transactionType: "Inheritance", documentRef: "TN-SUIT/2021/312" },
                    { date: "07 May 2009", ownerName: "Arumugam Pillai", transactionType: "Partition", documentRef: "PART/2009/205" },
                    { date: "28 Feb 1986", ownerName: "Poonamallee Community Syndicate", transactionType: "Sale", documentRef: "DEED/1986/451" },
                ],
            },
        },
    ],
};
/**
 * Raw Chandigarh Cadastral Dataset (Chandigarh UT Estate Office / e-Sampark Records)
 * Uses native Chandigarh terminology: propertyId, ownerFullName, sectorPlotNo, useType, disputeFlag
 * Coordinates: Chandigarh Sector 17 / Sector 22 (~30.73° N, 76.78° E)
 */
exports.rawParcelsChandigarh = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            id: "CH-PARCEL-201",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [76.7785, 30.7352],
                        [76.7818, 30.7356],
                        [76.7814, 30.7328],
                        [76.7781, 30.7324],
                        [76.7785, 30.7352],
                    ],
                ],
            },
            properties: {
                propertyId: "CH01S1742A", // 10-digit alphanumeric ULPIN
                ownerFullName: "Col. Harpreet Singh Sodhi (Retd.)",
                sectorPlotNo: "Khasra No. 42/B, Sector 17-C (Commercial SCO)",
                useType: "Commercial SCO (Shop-cum-Office)",
                disputeFlag: false,
                titleStatus: "Conveyance Deed Registered (Freehold Allotment)",
                encumbranceSummary: "Nil - Estate Office NOC Issued 2025",
                plotAreaHa: 0.45,
                collectorRateValuation: 18500000,
                propertyTaxDues: "Paid - FY25-26 Cleared (Receipt #CH-TAX-441)",
                utilityInfrastructure: [
                    "Chandigarh MC 24x7 Water Supply",
                    "Underground Duct Utility Corridor",
                    "Solar Feed-in Net Meter",
                ],
                chainOfTitle: [
                    { date: "20 May 2020", ownerName: "Col. Harpreet Singh Sodhi (Retd.)", transactionType: "Sale", documentRef: "UT-DEED/2020/0419" },
                    { date: "15 Oct 2007", ownerName: "Sardarni Manjit Sodhi", transactionType: "Inheritance", documentRef: "EST/2007/119" },
                    { date: "12 Apr 1984", ownerName: "Chandigarh Capital Project Allotment", transactionType: "Allotment", documentRef: "ALLOT/1984/042" },
                ],
            },
        },
        {
            type: "Feature",
            id: "CH-PARCEL-202",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [76.7825, 30.736],
                        [76.7858, 30.7364],
                        [76.7853, 30.7335],
                        [76.7821, 30.7331],
                        [76.7825, 30.736],
                    ],
                ],
            },
            properties: {
                propertyId: "CH02B2201B", // 10-digit alphanumeric ULPIN
                ownerFullName: "Gurpreet Kaur Dhillon & Amarjit Singh Brar",
                sectorPlotNo: "Khasra No. 118/A, Sector 22-A",
                useType: "Residential Freehold Villa",
                disputeFlag: false,
                titleStatus: "Clear Registered Allotment Deed",
                encumbranceSummary: "HDFC Bank Home Mortgage Lien Registered (₹45 Lakhs)",
                plotAreaHa: 0.35,
                collectorRateValuation: 9200000,
                propertyTaxDues: "Paid - FY25-26 Cleared (Receipt #CH-TAX-889)",
                utilityInfrastructure: [
                    "City Gas Distribution (PNG Pipeline)",
                    "Fiber-to-Home Optic Network",
                    "Stormwater Sewer Connection",
                ],
                ownerConsentRequired: true, // Consent-required in CH
                chainOfTitle: [
                    { date: "09 Feb 2022", ownerName: "Gurpreet Kaur Dhillon & Amarjit Singh Brar", transactionType: "Sale", documentRef: "CH-REG/2022/881" },
                    { date: "21 Aug 2013", ownerName: "Maj. Gen. Baldev Singh Dhillon", transactionType: "Inheritance", documentRef: "MUT/2013/310" },
                    { date: "14 Jul 1993", ownerName: "UT Housing Board Conveyance", transactionType: "Conveyance", documentRef: "EO/1993/118" },
                ],
            },
        },
        {
            type: "Feature",
            id: "CH-PARCEL-203",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [76.7788, 30.7318],
                        [76.782, 30.7322],
                        [76.7816, 30.7292],
                        [76.7784, 30.7288],
                        [76.7788, 30.7318],
                    ],
                ],
            },
            properties: {
                propertyId: "CH03I1788C", // 10-digit alphanumeric ULPIN
                ownerFullName: "Shivalik Institute of Technology & Research",
                sectorPlotNo: "Khasra No. 88/2, Sector 17-D",
                useType: "Institutional & Research Campus", // Institutional in CH
                disputeFlag: true, // Disputed in CH
                titleStatus: "Disputed - Show Cause Notice Issued under Sec 8-A",
                encumbranceSummary: "Estate Office Building Code Penalty ₹14.5 Lakhs pending",
                plotAreaHa: 0.95,
                collectorRateValuation: 26000000,
                propertyTaxDues: "Overdue Arrears - Demand Notice #2024/91", // Tax defaulter in CH
                utilityInfrastructure: [
                    "Dedicated 11kV Substation",
                    "Industrial Water Trunk Line Connection",
                ],
                chainOfTitle: [
                    { date: "17 Nov 2019", ownerName: "Shivalik Institute of Technology", transactionType: "Sale", documentRef: "UT-COM/2019/914" },
                    { date: "30 Mar 2006", ownerName: "Shivalik Educational Developers LLP", transactionType: "Mutation", documentRef: "MUT/2006/88" },
                    { date: "05 Nov 1988", ownerName: "Sector 17 Educational Pool Allottees", transactionType: "Auction", documentRef: "AUC/1988/088" },
                ],
            },
        },
    ],
};
