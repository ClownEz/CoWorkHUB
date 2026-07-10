from fastapi import APIRouter, Depends,HTTPException,Query,File,Request
from sqlalchemy import select,update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime,timezone
from app.dependincies import get_current_user
from app.database import get_db

from app.models.space import Space
from app.models.payment import Payment,PaymentStatus
from app.models.user import User
from app.models.booking import Booking,BookingStatus
from app.schemas.payment import PaymentCreate,PaymentOut
import stripe
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/payments",tags=["Payments"])

@router.post("/{booking_id}",response_model=PaymentOut)
async def create_payment(booking_id : int ,body : PaymentCreate, current_user : User = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
	result = await db.execute(select(Booking).where(Booking.id == booking_id,Booking.user_id == current_user.id,Booking.status == BookingStatus.pending))
	booking_exist = result.scalar_one_or_none()
	if not booking_exist:
		raise HTTPException(404,"Booking not found")
	intent = stripe.PaymentIntent.create(
		amount = int(booking_exist.total_price * 100),
		currency = "usd",
		metadata = {"booking_id":str(booking_id)}
	)
	payment = Payment(
		booking_id = booking_exist.id,
		amount = booking_exist.total_price,
		provider = "stripe",
		provider_payment_id = intent.id,
		status = PaymentStatus.pending
	)
	db.add(payment)
	await db.commit()
	await db.refresh(payment)
	return PaymentOut(
		id=payment.id,
		booking_id=payment.booking_id,
		amount=payment.amount,
		status=payment.status,
		provider=payment.provider,
		created_at=payment.created_at,
		client_secret=intent.client_secret
	)

@router.get("/{id}",response_model=PaymentOut)
async def check_payment(id:int,db:AsyncSession = Depends(get_db),current_user:User = Depends(get_current_user)):
	result = await db.execute(select(Payment).join(Payment.booking).where(Payment.id == id,Booking.user_id == current_user.id))
	payment = result.scalar_one_or_none()
	if not payment:
		raise HTTPException(403,"Payment not found")
	return payment

@router.get("/",response_model=list[PaymentOut])
async def get_all_payments(current_user : User = Depends(get_current_user),db : AsyncSession = Depends(get_db)):
	if current_user.role == "admin":
		result = await db.execute(select(Payment))
	else :
		result = await db.execute(select(Payment).join(Payment.booking).where(Booking.user_id == current_user.id))
	payment = result.scalars().all()
	return payment


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
	payload = await request.body()
	sig_header = request.headers.get("stripe-signature")

	try:
		event = stripe.Webhook.construct_event(
			payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
		)
	except ValueError:
		raise HTTPException(400, "Invalid payload")
	except stripe.error.SignatureVerificationError:
		raise HTTPException(400, "Invalid signature")

	if event["type"] == "payment_intent.succeeded":
		intent = event["data"]["object"]
		result = await db.execute(
			select(Payment).where(Payment.provider_payment_id == intent["id"])
		)
		payment = result.scalar_one_or_none()
		if payment:
			payment.status = PaymentStatus.succeeded
			await db.commit()

	return {"status": "ok"}