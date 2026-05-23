import socket
from concurrent.futures import ThreadPoolExecutor

def check_subdomain(subdomain, domain, results_list):
    target_host = f"{subdomain}.{domain}"
    try:
        # If the DNS lookup successfully resolves an IP address, it's active!
        socket.gethostbyname(target_host)
        results_list.append(target_host)
    except socket.gaierror:
        pass

def find_subdomains(domain):
    clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0]
    
    # Common passive recon subdomain naming conventions
    common_subdomains = [
        "www", "mail", "ftp", "admin", "blog", "api", "dev", "staging",
        "ssh", "secure", "webmail", "shop", "status", "ns1", "ns2",
        "docs", "git", "vpn", "cloud", "test", "portal", "support"
    ]
    
    found_subdomains = []
    
    # Check all subdomains simultaneously using 15 threads
    with ThreadPoolExecutor(max_workers=15) as executor:
        for sub in common_subdomains:
            executor.submit(check_subdomain, sub, clean_domain, found_subdomains)
            
    return found_subdomains
