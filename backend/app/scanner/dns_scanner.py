import dns.resolver


def get_dns_records(domain):

    records = {
        "A": [],
        "MX": [],
        "NS": [],
        "TXT": []
    }

    try:

        for rdata in dns.resolver.resolve(domain, "A"):
            records["A"].append(rdata.to_text())

    except:
        pass

    try:

        for rdata in dns.resolver.resolve(domain, "MX"):
            records["MX"].append(rdata.exchange.to_text())

    except:
        pass

    try:

        for rdata in dns.resolver.resolve(domain, "NS"):
            records["NS"].append(rdata.to_text())

    except:
        pass

    try:

        for rdata in dns.resolver.resolve(domain, "TXT"):
            records["TXT"].append(rdata.to_text())

    except:
        pass

    return records
