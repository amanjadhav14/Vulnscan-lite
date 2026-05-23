import nmap


def scan_ports(domain):

    scanner = nmap.PortScanner()

    ports_data = []

    try:

        scanner.scan(domain, arguments="-F")

        for host in scanner.all_hosts():

            for proto in scanner[host].all_protocols():

                ports = scanner[host][proto].keys()

                for port in ports:

                    ports_data.append({
                        "port": port,
                        "state": scanner[host][proto][port]["state"],
                        "service": scanner[host][proto][port]["name"]
                    })

    except Exception as e:

        print(e)

    return ports_data
