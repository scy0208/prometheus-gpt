export const config = {
    runtime: 'edge',
}

interface TopicTemplate {
    [key: string]: string;
}

const topics_with_template: TopicTemplate = {
    "Unsolicited Ads": "",
    "Vendor Emails": "",

    "First-Time Refund": `Hi Dear,
Thank you for your email and I'm sorry to hear you didn't like the products!
Before initiating the return, I'd like to know if you'd like to exchange or resize? We can offer you free exchange if the sizes don't fit or you'd like to make minor adjustments.
Your feedback is much appreciated! We'd like to learn more about your experience and see if we have more alternatives before initiating the return.
Thank you so much for your support!

Best,
Hana

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,
    
    "Persistent Refund": `Hi Dear,

Thank you for your feedback, sorry to hear you didn't like them. 

To proceed with the return, please keep the items in its original packaging and send them back to the return address attached. As we don't have a return label, the shipping will be at your own cost. 

Please send us the shipping label or tracking number once you have it, and then we can refund you via your original payment method.

It's a pity to see you go, we'll work hard to improve the aspects you mentioned and sincerely hope to see you again in the future!

Thank you so much for your support and understanding!

Return to:
Hana K 2665 North 1st Street, #110, San Jose, CA 95134

Best,
H

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,

    "Shipping Mistake": `Hi Deari,
Thanks for your email! Sorry it must be a wrong fulfillment by our crew. I'll arrange the correct one sent to you asap.
You shall receive an email of a new order soon and there's no action needed on your end.
Apologies for the mistake and thank you for your order!

Love,
Hana 

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,
    
    "Positive Reviews": 
        `Hi Dear,
Thank you so much for your lovely message! This made our day! 
Your satisfaction means a lot to us! If possible, could you please write a review for us here: https://www.trustpilot.com/evaluate/hanakoko.comThis will greatly help us as a small business!
In return, here is a code for 40% off on your next order: use Trusthana40 for 40% off on any order, no minimum required.
Thank you so much again for your support!
Best,Hana
-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here`,

    "Complain Size Fit": `Hi Diana,
Thank you for your email and sorry to hear they don't fit perfectly.
We recommend you try out customization next time by checking the box and leave your exact sizes. If you don't want a full customization you can add pieces for $1 per piece (which means $2 if you want 2 nails of the same size). However we recommend adding those when you make the purchase together because for every batch the gel and the charms might be slightly different, especially for some ombre colors they may not come out the same every time. Due to the hand-made nature this is something we don't have a solution yet.
For your existing sets we can do extra for you if you don't mind the slight color differences, another simpler alternative is that we do some styles that can go with all sets (like nude ombre or gold ombre) that you can use to go with the existing styles which would also look matchy. Let me know how you'd like to add. 
Thank you so much again for your order!
Best,Hana
-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here`,
    
    "Complain Quality": "",
    "Complain Design": "",
    "Other Negative Reviews": "",
    
    "Shipping Query": `Hi,
Thank you for your email! I just checked your order, it's already left at the post office with tracking number xxxxx. You should be able to check your tracking update in it in 2-3 days.
Please note:If the system shows "USPS Awaiting Item" or "USPS shipping partner facility transit", it's usually the two situations:1) A third-party vendor is carrying the goods for your local USPS to deliver the last mile, so USPS only updates when the parcel is at your local office2) It's an international package outside USA so your local courier may generate a new tracking number after it arrived at your country
Thank you so much for shopping with us! Let me know if you have any other questions.
Best,Hana

-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here `,
    
    "Order Cancel": `Hi ,

Thank you for your email!

We understand that you've requested a refund. However, as per our records, your order has already been dispatched and is currently on its way to you.

In this regard, I would like to kindly ask for your patience until the package arrives. Our team has put considerable effort into making these sets and we truly believe that you will be delighted with the product. We appreciate your understanding that we are unable to halt the delivery or issue a refund at this time being.

Nevertheless, we understand that every customer has different needs and preferences. If you find the product unsatisfactory after it arrives, please feel free to reach out to us. We are committed to ensuring the satisfaction of our customers and are ready to assist you with any concerns you may have.

Thank you for your understanding and patience. Your support means a lot to us.

Best regards,
Hana

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,
    
    "Order Info Update": `Hi Dear,
We're making your sets now, could you pls give me your size? Pls see our size chart below.
Also here's a video if you don't know how to measure: https://www.tiktok.com/@hanakoko_offical/video/7257669076921683243
What if I have in-between sizes.jpg
Looking forward to it!

Thanks,
Hana

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,
    
    "Engagement Incentive": `Hi Dear,
Thank you so much for your support in tagging us on socials! To claim your thank-you discount, please 1) Send me the link or a screenshot of the post (here or on social media both ok)2) Use code "Hanakokobestie" at checkout, the price will be automatically deducted.
Thank you so much again for your order! Your support means a lot to us!
Love,Hana
-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here 
    `,
    "Other Customer Support": "",
    "Unpaid KOL Collaboration": `Hi Dear,
It's so nice to hear back from you! We're super excited to initiate your first collab on Tiktok with us! Below are everything you need to know for our next steps.
Brief:Please click and read to better understand our brand and this collab: Hanakoko Collab Brief
Claim your PR packagePlease choose 4 sets you like through this exclusive link: Your Collab LinkIf the order is less than or equals 4 sets, it will automatically turn to $0.
Important: - Please leave your social media handle in the "note" section in your cart, otherwise we cannot identify your order 
ShippingShipping is free, on usYou'll receive the tracking info once your gift is shipped
Share and TagTo go with your content here is the discount code for your followers, please share the code Hanakoko15 with our website link hanakoko.com so that your fans can get 15% off all orders.
Or
Join our affiliate program where you can get your own code to earn 15% commission on all orders you generate. Just apply here: hanakoko affiliate link
Put in your info and an email with your own code and link will be sent to you. 
You can choose to share either code, the only difference is whether you're in to fill out a form to get commission. You can choose whichever works best for you. 

*Upon ordering, you automatically confirm that you've read the information listed above and agree to take part in this collab

Let me know if you have any other questions! Looking forward to our collab!
Thank you,Hana

-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here`,

    "Paid KOL Collaboration": "",

    "KOL Package Received": `Hi beautiful!
How are you? Hope you're doing great!
This is Hana from Hanakoko, we've sent you a collab gift box of nail products! Our courier informed us your package has been delivered, so I'm writing to check in if you've received it?
Have you got a chance to try the nails out? How do you like them? 
If you're ready to create some wonderful content, here are 2 options for the discount code:
1) Share the code Hanakoko15 with our website link hanakoko.com so that your fans can get 15% off all orders.
Or
2) Join our affiliate program where you'll get your own code for 15% for fans as well as earn 15% commission on all orders you generate. Just apply here: hanakoko affiliate link
Put in your info and an email with your own code and link will be sent to you. 
You can choose to share either code, the only difference is whether you're in to fill out a form to get commission. You can choose whichever works best for you. 
After you post the content, please kindly send us the link of the video. 
Thank you for being our collab influencer and looking forward to seeing your post soon!
Love,Hana

-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here 
`,
    
    "KOL Content Commitment": `"Hi Dear,
That sounds good! Thank you so much! 

When you post the video, please include your collab code (折扣码）and leave our site www.hanakoko.com in the caption.

Also please send us the link of the video, really excited to see it!

Thank you again and look forward to it!

Best,
Hana
    
--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here"`,

    "KOL Content Published": `Hi Beautiful!

We love your content! Thank you so much for making this amazing video!
Let me know if you're open for more collabs in the future, we'll definitely want to work again with you!

Best,
Hana

--
Hanakoko | Be your own nail artist at home
Shop www.hanakoko.com
Follow us @hanakoko_official on all socials
Be an affiliate & Earn commissions: Apply here`,

    "KOL Promo Code": `Hi Dear,
Thank you so much for joining our collab program! To go with your content here is the discount code for your followers, please share the code Hanakoko15 with our website link hanakoko.comso that your fans can get 15% off all orders.
Also, we'd like to invite you to join our affiliate program where you can get your own code to earn 15% commission on all orders you generate. Just apply here: hanakoko affiliate linkPut in your info and an email with your own code and link will be sent to you. 
You can choose to share either code, the only difference is whether you're in to fill out a form to get commission. You can choose whichever works best for you. 
Thank you so much again and look forward to your beautiful creatives!
Best,Hana

-- 
Hanakoko | Be your own nail artist at homeShop www.hanakoko.comFollow us @hanakoko_official on all socialsBe an affiliate & Earn commissions: Apply here`,

    "Other KOL Topics": ""
  }

  type RequestData = {
    topic: string
  }

  export default async function POST(request: Request) {
    const { topic } = (await request.json()) as RequestData
    const template = topics_with_template[topic]
    if (!template) {
      return new Response("", { status: 200 })
    }
    return new Response(template, { status: 200 })
  }