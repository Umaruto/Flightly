# Import models so that Base.metadata.create_all sees them
from .user import User  # noqa: F401
from .airline_company import AirlineCompany  # noqa: F401
from .flight import Flight  # noqa: F401
from .ticket import Ticket  # noqa: F401
from .banner import Banner  # noqa: F401
